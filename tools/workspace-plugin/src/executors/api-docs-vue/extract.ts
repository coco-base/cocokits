import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import ts from 'typescript';
import { loadPackage } from '../load-module';
import { srcEntryPointsOf } from '../api-docs-common/entries';
import {
  aliasResolverAt,
  aliasValuesOf,
  createTsProgram,
  expandAliases,
  sharedTypeProblems,
} from '../api-docs-common/expand-alias';
import { enclosingDefaults, typeParameterDefaults, withDefaultArguments } from '../api-docs-common/generic';
import { memberOf, withoutUndefined } from '../api-docs-common/member';
import { placeAt, placeOf } from '../api-docs-common/places';
import { problemsError } from '../api-docs-common/run';
import { posix } from '../posix-path';
import { exportedTypesOf, memberTypeTexts } from '../api-docs-common/exported-types';
import { docTextOf, tagsOfNode, unrealTagsOf, wholeDocOf } from '../api-docs-common/jsdoc';
import type { SourcePlace, TsDocText } from '../api-docs-common/jsdoc';
import { checkPartDoc, frameworkOnlyOf, isInternal, paragraphsOf, partDocFields } from '../api-docs-common/tags';
import { vueSlotScopes } from '../api-docs-common/scope';
import type {
  ApiDocJson,
  ApiMemberJson,
  ApiPartJson,
  ApiSlotJson,
  ApiValueJson,
  TagEntry,
} from '../api-docs-common/types';

/** The part of `vue-component-meta` this executor uses. */
interface MetaTag {
  readonly name: string;
  readonly text?: string;
}
interface MetaMember {
  readonly name: string;
  readonly type: string;
  readonly description: string;
  readonly tags: readonly MetaTag[];
  readonly required?: boolean;
  readonly global?: boolean;
  readonly default?: string;
  /** Where the member is declared: the file and the start and end of the declaration (not its comment). */
  getDeclarations?(): readonly { file: string; range: readonly [number, number] }[];
}
interface ComponentMeta {
  readonly props: readonly MetaMember[];
  readonly events: readonly MetaMember[];
  readonly slots: readonly MetaMember[];
  readonly exposed: readonly MetaMember[];
}
interface MetaChecker {
  getComponentMeta(file: string): ComponentMeta;
  dispose?: () => void;
}
interface MetaModule {
  createChecker: (tsConfig: string, options: { forceUseTs: boolean; schema: { ignore: string[] } }) => MetaChecker;
}

const tagEntriesOf = (tags: readonly MetaTag[]): TagEntry[] =>
  tags.map((tag) => ({ name: tag.name, comment: tag.text ?? '' }));

/**
 * The description and tags of a member. `vue-component-meta` reads them with the TypeScript parser, which cuts a text
 * at an `@` that is no tag (`@click` in an example), so then they are read again from the comment above the
 * declaration of the member.
 */
function memberDocOf(member: MetaMember): TsDocText {
  const given = { description: member.description, tags: tagEntriesOf(member.tags) };
  if (unrealTagsOf(given.tags).length === 0) return given;
  const places = (member.getDeclarations?.() ?? []).flatMap(({ file, range }): SourcePlace[] =>
    existsSync(file) ? [{ text: readFileSync(file, 'utf8'), position: range[0] }] : [],
  );
  return wholeDocOf(given, places);
}

/** The text of a source default, unless it says nothing (`withDefaults` with `undefined`). */
const sourceDefaultOf = (value: string | undefined): string | undefined =>
  value === undefined || value === 'undefined' ? undefined : value;

interface NodeDoc {
  description: string;
  tags: TagEntry[];
}

const docOf = (node: ts.Node): NodeDoc => ({ description: docTextOf(node), tags: tagsOfNode(node) });

/** The interface or type alias `typeName`, declared in a `*.types.ts` file of the folder. */
function typeDeclarationOf(
  dir: string,
  typeName: string,
): ts.InterfaceDeclaration | ts.TypeAliasDeclaration | undefined {
  for (const file of readdirSync(dir).filter((item) => item.endsWith('.types.ts'))) {
    const path = join(dir, file);
    const source = ts.createSourceFile(path, readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true);
    for (const statement of source.statements) {
      if (
        (ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement)) &&
        statement.name.text === typeName
      )
        return statement;
    }
  }
  return undefined;
}

/**
 * The TSDoc of each event of a `<Name>Emits` type of the folder, by event name. `vue-component-meta` reads an event's
 * TSDoc from a call signature and loses the comment of the named-tuple form, which the guide asks for, so the
 * comments are read from the type itself.
 */
function emitDocsOf(dir: string, typeName: string): Map<string, NodeDoc> {
  const declaration = typeDeclarationOf(dir, typeName);
  const literal = declaration && ts.isTypeAliasDeclaration(declaration) ? declaration.type : declaration;
  const members =
    literal && (ts.isTypeLiteralNode(literal) || ts.isInterfaceDeclaration(literal)) ? literal.members : [];
  const docs = new Map<string, NodeDoc>();
  for (const member of members) {
    const name = member.name;
    if (name && (ts.isIdentifier(name) || ts.isStringLiteral(name))) {
      docs.set(name.text, docOf(member));
    }
  }
  return docs;
}

/** Expands the aliases of string literals in the type text of a member, with the `@cckValue` meanings of them. */
type Expand = (type: string, member: string) => { text: string; values: ApiValueJson[]; at?: ts.Node };

/** The program, its checker and every types file of a component folder. */
interface Scope {
  readonly program: ts.Program;
  readonly checker: ts.TypeChecker;
  readonly sources: readonly ts.SourceFile[];
}

/**
 * The expander of the props of `<Name>Props`, declared in any types file of the folder. A prop is usually picked from
 * a machine type, so its alias is in scope where the machine declares the property, not in the types file: the scope
 * is the declaration of the property.
 */
function expanderOf(scope: Scope | undefined, typeName: string): Expand {
  const first = scope?.sources[0];
  if (scope === undefined || first === undefined) return (type) => ({ text: type, values: [] });
  const { program, checker, sources } = scope;
  const declaration = sources
    .flatMap((source) => source.statements)
    .find(
      (statement): statement is ts.TypeAliasDeclaration | ts.InterfaceDeclaration =>
        (ts.isTypeAliasDeclaration(statement) || ts.isInterfaceDeclaration(statement)) &&
        statement.name.text === typeName,
    );
  const propsType = declaration && checker.getTypeAtLocation(declaration.name);
  return (type, member) => {
    const property = propsType?.getProperty(member)?.declarations?.[0];
    const written = withDefaultArguments(type, enclosingDefaults(property));
    const at = property ?? declaration ?? first;
    const resolve = aliasResolverAt(program, at);
    return { text: expandAliases(written, resolve), values: aliasValuesOf(written, resolve), at };
  };
}

function listOf(
  componentName: string,
  partName: string,
  items: readonly MetaMember[],
  problems: string[],
  isProp: boolean,
  expand: Expand,
): ApiMemberJson[] {
  const result: ApiMemberJson[] = [];
  for (const item of items) {
    const required = isProp && item.required === true;
    const expanded = expand(withoutUndefined(item.type, required || !isProp), item.name);
    const doc = memberDocOf(item);
    const member = memberOf(
      componentName,
      {
        name: item.name,
        type: expanded.text,
        aliasValues: expanded.values,
        required,
        description: doc.description,
        tags: doc.tags,
        sourceDefault: isProp ? sourceDefaultOf(item.default) : undefined,
      },
      partName,
      problems,
    );
    if (member === undefined) problems.push(`${partName}.${item.name}: no TSDoc description`);
    else result.push(placeAt(member, expanded.at));
  }
  return result;
}

/** The slots with the scope their `defineSlots` declares (a slot without props has none). */
function withScopes(
  slots: ApiMemberJson[],
  file: string,
  owner: string,
  problems: string[],
  defaults: ReadonlyMap<string, string>,
): ApiSlotJson[] {
  const script = /<script[^>]*>([\s\S]*?)<\/script>/.exec(readFileSync(file, 'utf8'))?.[1] ?? '';
  const scopes = vueSlotScopes(script, owner, problems, defaults);
  return slots.map((slot) => {
    const scope = scopes.get(slot.name);
    return scope === undefined || scope.length === 0 ? slot : placeAt({ ...slot, scope }, placeOf(slot));
  });
}

/** The events with the comment of the `<Name>Emits` type where the checker lost it (a named tuple). */
function eventsWithDocs(events: readonly MetaMember[], emitDocs: ReadonlyMap<string, NodeDoc>): MetaMember[] {
  return events.map((event) => {
    const documented = emitDocs.get(event.name);
    if (documented === undefined || event.description !== '') return event;
    return {
      ...event,
      description: documented.description,
      tags: documented.tags.map((tag) => ({ name: tag.name, text: tag.comment })),
    };
  });
}

/** The props to list: not a global prop (`key`, `ref`), and not one the framework fills itself (`modelModifiers`, `@internal`). */
function shownProps(props: readonly MetaMember[]): MetaMember[] {
  return props.filter((prop) => prop.global !== true && !isInternal(tagEntriesOf(prop.tags)));
}

/** The exposed methods to list: not an instance member named with `$`, and not a prop. */
function shownMethods(exposed: readonly MetaMember[], props: readonly MetaMember[]): MetaMember[] {
  return exposed.filter((item) => !item.name.startsWith('$') && !props.some((prop) => prop.name === item.name));
}

/** The `v-model` bindings: a prop `x` with an `update:x` event. */
function bindingsOf(
  props: readonly ApiMemberJson[],
  events: readonly MetaMember[],
): NonNullable<ApiPartJson['bindings']> {
  return props.flatMap((prop) =>
    events.some((event) => event.name === `update:${prop.name}`)
      ? [
          {
            semanticId: prop.semanticId,
            value: prop.name,
            syntax: prop.name === 'modelValue' ? 'v-model' : `v-model:${prop.name}`,
          },
        ]
      : [],
  );
}

function partOf(
  componentName: string,
  name: string,
  dir: string,
  meta: ComponentMeta,
  problems: string[],
  scope: Scope | undefined,
): ApiPartJson {
  const expand = expanderOf(scope, `${name}Props`);
  const typeName = `${name}Props`;
  const declaration = typeDeclarationOf(dir, typeName);
  const doc = declaration && docOf(declaration);
  if (doc === undefined) problems.push(`${name}: the folder needs an exported ${typeName} in a *.types.ts file`);
  const tags = doc?.tags ?? [];
  const text = doc?.description ?? '';
  const partProblems = doc ? problems : [];
  const part = checkPartDoc(typeName, tags, text, partProblems);
  const props = shownProps(meta.props);
  const emitDocs = emitDocsOf(dir, `${name}Emits`);
  const events = eventsWithDocs(meta.events, emitDocs);
  // A part other than the root carries its name in the semantic id of its members (`tabs.trigger.value`).
  const idScope = part === 'root' || part === '' ? componentName : `${componentName}.${part}`;
  const result: ApiPartJson = {
    name,
    semanticId: `${componentName}.${part}`,
    anatomyPart: part,
    ...frameworkOnlyOf(typeName, tags, partProblems),
    description: paragraphsOf(text)[0] ?? '',
    ...partDocFields(text, tags),
    props: listOf(idScope, name, props, problems, true, expand),
    events: listOf(idScope, name, events, problems, false, expand),
    slots: withScopes(
      listOf(componentName, name, meta.slots, problems, false, expand),
      join(dir, `${name}.vue`),
      name,
      problems,
      typeParameterDefaults(declaration?.typeParameters),
    ),
    methods: listOf(componentName, name, shownMethods(meta.exposed, props), problems, false, expand),
  };
  const bindings = bindingsOf(result.props, events);
  if (bindings.length > 0) result.bindings = bindings;
  return result;
}

/** Every `*.types.ts` file of a folder: a component may split its part types over several. */
const typesFilesOf = (dir: string): string[] =>
  readdirSync(dir)
    .filter((item) => item.endsWith('.types.ts'))
    .sort()
    .map((file) => posix(join(dir, file)));

/**
 * The `ApiDoc` of every Vue entry point of a package (`src/<component>/index.ts`), from `vue-component-meta`: the
 * props, emits, slots and exposed methods of each `.vue` file of the folder. A part's `@cckPart` is on its exported
 * `<Name>Props` type in the folder's `*.types.ts`. Global props (`key`, `ref`) are not listed, and a `@defaultValue`
 * tag wins over a default in `withDefaults`. Throws one error that lists every problem and writes nothing.
 *
 * @param root - The workspace root.
 * @param projectRoot - The absolute folder of the package.
 * @param tsConfig - The absolute path of the package tsconfig.
 */
export function extractVueApiDocs(root: string, projectRoot: string, tsConfig: string): ApiDocJson[] {
  const entries = srcEntryPointsOf(projectRoot);
  if (entries.length === 0) throw new Error(`${projectRoot} has no Vue entry point (src/<name>/index.ts)`);
  const { createChecker } = loadPackage(root, 'vue-component-meta') as MetaModule;
  const checker = createChecker(posix(tsConfig), { forceUseTs: true, schema: { ignore: [] } });
  const problems: string[] = [];
  const typeFiles = entries.map(({ dir }) => typesFilesOf(dir));
  const program = createTsProgram(tsConfig, [...typeFiles.flat(), ...entries.map((entry) => entry.file)]);
  const typeChecker = program.getTypeChecker();
  try {
    const docs = entries.map(({ name, dir, file }, index): ApiDocJson => {
      const sources = (typeFiles[index] ?? []).flatMap((file) => program.getSourceFile(file) ?? []);
      const scope = sources.length === 0 ? undefined : { program, checker: typeChecker, sources };
      const files = readdirSync(dir)
        .filter((file) => file.endsWith('.vue'))
        .sort();
      if (files.length === 0) problems.push(`${name}: the entry point has no .vue component`);
      const parts = files.map((file) =>
        partOf(name, basename(file, '.vue'), dir, checker.getComponentMeta(posix(join(dir, file))), problems, scope),
      );
      const indexFile = program.getSourceFile(file);
      const own = new Set(parts.flatMap((part) => [`${part.name}Props`, `${part.name}Emits`, `${part.name}Slots`]));
      const types =
        indexFile === undefined
          ? []
          : exportedTypesOf(
              program,
              typeChecker,
              indexFile,
              name,
              (item) => own.has(item),
              problems,
              memberTypeTexts(parts),
            );
      return { component: name, framework: 'vue', parts, ...(types.length > 0 ? { types } : {}) };
    });
    problems.push(...sharedTypeProblems(program));
    if (problems.length > 0) throw problemsError(problems);
    return docs;
  } finally {
    checker.dispose?.();
  }
}
