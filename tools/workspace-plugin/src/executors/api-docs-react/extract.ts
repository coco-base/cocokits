import { basename } from 'node:path';
import ts from 'typescript';
import { srcEntryPointsOf } from '../api-docs-common/entries';
import {
  aliasResolverAt,
  aliasValuesOf,
  createTsProgram,
  expandAliases,
  isOwn,
  sharedTypeProblems,
} from '../api-docs-common/expand-alias';
import { enclosingDefaults, withDefaultArguments } from '../api-docs-common/generic';
import { placeOfNode, wholeDocOf } from '../api-docs-common/jsdoc';
import type { TsDocText } from '../api-docs-common/jsdoc';
import { memberOf, withoutUndefined } from '../api-docs-common/member';
import { placeAt, placeOf } from '../api-docs-common/places';
import { problemsError } from '../api-docs-common/run';
import { exportedTypesOf, memberTypeTexts } from '../api-docs-common/exported-types';
import {
  checkParity,
  checkPartDoc,
  frameworkOnlyOf,
  paragraphsOf,
  partDocFields,
  tagsOf,
} from '../api-docs-common/tags';
import type {
  ApiDocJson,
  ApiMemberJson,
  ApiPartJson,
  ApiSlotJson,
  ApiValueJson,
  TagEntry,
} from '../api-docs-common/types';
import { displayTextOf } from './display-text';

const tagsOfSymbol = (checker: ts.TypeChecker, symbol: ts.Symbol): TagEntry[] =>
  symbol.getJsDocTags(checker).map((tag) => ({ name: tag.name, comment: displayTextOf(tag.text) }));

/**
 * The description and the tags of a symbol. The checker reads them with the TypeScript parser, which cuts a text at an
 * `@` that is no tag (`@click` in an example), so then they are read again from the comment of its declaration.
 */
const docOfSymbol = (checker: ts.TypeChecker, symbol: ts.Symbol): TsDocText =>
  wholeDocOf(
    {
      description: displayTextOf(symbol.getDocumentationComment(checker)),
      tags: tagsOfSymbol(checker, symbol),
    },
    (symbol.declarations ?? []).map(placeOfNode),
  );

/**
 * The type as the author wrote it when the declaration has a type annotation (so `ReactElement` stays `ReactElement`
 * and does not print its default type arguments), else the checker's text.
 */
function typeTextOf(checker: ts.TypeChecker, symbol: ts.Symbol, declaration: ts.Declaration): string {
  const written =
    (ts.isPropertySignature(declaration) || ts.isPropertyDeclaration(declaration)) && declaration.type
      ? declaration.type.getText().replace(/\s+/g, ' ')
      : undefined;
  return (
    written ??
    checker.typeToString(
      checker.getTypeOfSymbolAtLocation(symbol, declaration),
      declaration,
      ts.TypeFormatFlags.NoTruncation,
    )
  );
}

/** `ApiMember` of one prop, or a problem when it has no TSDoc. */
function propOf(
  program: ts.Program,
  checker: ts.TypeChecker,
  componentName: string,
  partName: string,
  symbol: ts.Symbol,
  problems: string[],
  asSlot: boolean,
): ApiMemberJson | undefined {
  const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0];
  if (!declaration || !isOwn(program, declaration)) return undefined;
  const required = (symbol.flags & ts.SymbolFlags.Optional) === 0;
  const written = withDefaultArguments(typeTextOf(checker, symbol, declaration), enclosingDefaults(declaration));
  const resolve = aliasResolverAt(program, declaration);
  const type = expandAliases(written, resolve);
  const doc = docOfSymbol(checker, symbol);
  const member = memberOf(
    componentName,
    {
      name: asSlot && symbol.name === 'children' ? 'default' : symbol.name,
      type: withoutUndefined(type, required),
      required,
      description: doc.description,
      tags: doc.tags,
      aliasValues: aliasValuesOf(written, resolve),
    },
    partName,
    problems,
  );
  if (member === undefined) {
    const where = basename(declaration.getSourceFile().fileName);
    problems.push(`${partName}.${symbol.name}: no TSDoc description (declared in ${where})`);
  }
  return member && placeAt(member, declaration);
}

/** Whether a prop is a slot: its declared type is `ReactNode` or `React.ReactNode`, with or without `undefined` or `null`. */
function isSlot(symbol: ts.Symbol): boolean {
  return scopedSlotType(symbol) !== undefined || isNodeType(symbol);
}

const isReactNode = (text: string): boolean => text === 'ReactNode' || text === 'React.ReactNode';

function isNodeType(symbol: ts.Symbol): boolean {
  const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0];
  if (!declaration || !(ts.isPropertySignature(declaration) || ts.isPropertyDeclaration(declaration))) return false;
  const types = (declaration.type?.getText() ?? '')
    .split('|')
    .map((type) => type.trim())
    .filter((type) => type !== 'undefined' && type !== 'null');
  return types.length === 1 && isReactNode(types[0] ?? '');
}

/**
 * The function type of a scoped slot, `(scope: S) => ReactNode` (optional, so with or without `| undefined`): a slot
 * whose scope is the members of `S`.
 */
function scopedSlotType(symbol: ts.Symbol): ts.FunctionTypeNode | undefined {
  const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0];
  if (!declaration || !(ts.isPropertySignature(declaration) || ts.isPropertyDeclaration(declaration))) return undefined;
  const members = typeMembers(declaration.type);
  const fn = members
    .map((member) => (ts.isParenthesizedTypeNode(member) ? member.type : member))
    .find(ts.isFunctionTypeNode);
  return fn?.parameters.length === 1 && fn.parameters[0]?.type !== undefined && isReactNode(fn.type.getText())
    ? fn
    : undefined;
}

/** The members of a union type, or the type itself; nothing for no type. */
function typeMembers(type: ts.TypeNode | undefined): readonly ts.TypeNode[] {
  if (type === undefined) return [];
  return ts.isUnionTypeNode(type) ? type.types : [type];
}

/**
 * The scope of a scoped slot: the members of the parameter's type, each with its TSDoc (a missing one is a problem). A
 * field tagged `@cckSemantic none` needs a `@cckParity` reason and is written with `semanticId: 'none'`.
 */
function scopeOf(
  checker: ts.TypeChecker,
  fn: ts.FunctionTypeNode,
  owner: string,
  problems: string[],
  tags: readonly TagEntry[],
): NonNullable<ApiSlotJson['scope']> {
  const parameter = fn.parameters[0]?.type;
  const type = parameter === undefined ? undefined : checker.getTypeFromTypeNode(parameter);
  const properties = (type?.getProperties() ?? []).filter((property) => !isPrimitiveMember(type, property));
  if (properties.length === 0 && parameter !== undefined) {
    // A parameter that is not an object (`(value: V) => ReactNode`) is one field, named after the parameter; its text
    // is the `@param` tag of the prop.
    const name = fn.parameters[0]?.name.getText() ?? 'value';
    const text = tagsOf(tags, 'param')
      .map((tag) =>
        tag.startsWith(`${name} `)
          ? tag
              .slice(name.length)
              .replace(/^\s*-?\s*/, '')
              .trim()
          : '',
      )
      .find((tagText) => tagText !== '');
    if (text === undefined)
      problems.push(`${owner}: the function parameter "${name}" needs a "@param ${name} - ..." tag`);
    // The field has no TSDoc of its own: a `@cckParity` reason on the prop says the function form is this
    // framework's own, so the field exists here only by design.
    const frameworkOnly = tagsOf(tags, 'cckParity').some((reason) => reason !== '');
    return [
      {
        name,
        type: withDefaultArguments(parameter.getText().replace(/\s+/g, ' '), enclosingDefaults(parameter)),
        description: paragraphsOf(text ?? '')[0] ?? '',
        ...(frameworkOnly ? { semanticId: 'none' as const } : {}),
      },
    ];
  }
  return properties.map((property) => {
    const declaration = property.valueDeclaration ?? property.declarations?.[0];
    const description = paragraphsOf(displayTextOf(property.getDocumentationComment(checker)))[0] ?? '';
    if (description === '') problems.push(`${owner}: the scope field "${property.name}" has no TSDoc description`);
    const text =
      declaration !== undefined && ts.isPropertySignature(declaration) && declaration.type !== undefined
        ? declaration.type.getText().replace(/\s+/g, ' ')
        : checker.typeToString(checker.getTypeOfSymbol(property));
    // A type parameter of the scope type is written with its default, as the members of a generic component are.
    const frameworkOnly = checkParity(
      `${owner}: the scope field "${property.name}"`,
      tagsOfSymbol(checker, property),
      problems,
    );
    return {
      name: property.name,
      type: withDefaultArguments(text, enclosingDefaults(declaration)),
      description,
      ...(frameworkOnly ? { semanticId: 'none' as const } : {}),
    };
  });
}

/** Whether a member belongs to a primitive's apparatus (`toString` of a string), not to a scope object. */
function isPrimitiveMember(type: ts.Type | undefined, property: ts.Symbol): boolean {
  return (
    type !== undefined &&
    (type.flags & (ts.TypeFlags.StringLike | ts.TypeFlags.NumberLike | ts.TypeFlags.BooleanLike)) !== 0 &&
    property.name !== ''
  );
}

/** Whether a prop is an event: a CocoKits callback named `on<Thing>` (the native `on*` handlers are not own declarations). */
function isEvent(symbol: ts.Symbol): boolean {
  return /^on[A-Z]/.test(symbol.name);
}

/**
 * The members of the branches of a union props type, in one list. A member of every branch keeps its first branch's
 * text, with the types of the other branches joined by `|` (`'single' | 'multiple'`), and is required only when every
 * branch requires it; a member of some branches only is optional. Its value meanings are those of every branch, the
 * first meaning of a value winning, so each branch can mean its own literal.
 */
function mergeBranches(branches: readonly ApiMemberJson[][]): ApiMemberJson[] {
  const names = [...new Set(branches.flatMap((list) => list.map((member) => member.name)))];
  return names.flatMap((name): ApiMemberJson[] => {
    const found = branches.map((list) => list.find((member) => member.name === name));
    const own = found.filter((member): member is ApiMemberJson => member !== undefined);
    const [head] = own;
    if (head === undefined) return [];
    const types = [...new Set(own.map((member) => member.type))];
    const meanings = new Map<string, ApiValueJson>();
    for (const value of own.flatMap((member) => member.values ?? [])) {
      if (!meanings.has(value.value)) meanings.set(value.value, value);
    }
    const values = [...meanings.values()];
    const merged: ApiMemberJson = {
      ...head,
      type: types.join(' | '),
      required: found.every((member) => member?.required === true),
      ...(values.length > 0 ? { values } : {}),
    };
    // The merged member keeps the place of its first branch, where its type names are read.
    return [placeAt(merged, placeOf(head))];
  });
}

/** The props type of a component: the type of the first parameter of its call signature. */
function propsTypeOf(checker: ts.TypeChecker, component: ts.Symbol): ts.Type | undefined {
  const declaration = component.valueDeclaration ?? component.declarations?.[0];
  if (!declaration) return undefined;
  const [signature] = checker.getTypeOfSymbolAtLocation(component, declaration).getCallSignatures();
  const parameter = signature?.parameters[0];
  const parameterDeclaration = parameter?.valueDeclaration ?? parameter?.declarations?.[0];
  return parameter && parameterDeclaration
    ? checker.getTypeOfSymbolAtLocation(parameter, parameterDeclaration)
    : undefined;
}

/** The exported function components of an entry: values with a call signature and a capitalised name. */
function componentsOf(checker: ts.TypeChecker, file: ts.SourceFile): ts.Symbol[] {
  const moduleSymbol = checker.getSymbolAtLocation(file);
  if (!moduleSymbol) return [];
  return checker
    .getExportsOfModule(moduleSymbol)
    .filter((exported) => /^[A-Z]/.test(exported.name))
    .map((exported) => (exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported))
    .filter((symbol) => (symbol.flags & ts.SymbolFlags.Value) !== 0)
    .filter((symbol) => {
      const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0];
      return !!declaration && checker.getTypeOfSymbolAtLocation(symbol, declaration).getCallSignatures().length > 0;
    })
    .filter((symbol) => !symbol.getJsDocTags(checker).some((tag) => tag.name === 'internal'));
}

/**
 * The `ApiDoc` of every React entry point of a package (`src/<component>/index.ts`), from the TypeScript checker. Each
 * exported component is a part. Its props are the properties of its props type that a CocoKits file declares, so the
 * native button props and `ref` it inherits are not listed, and a prop the machine documents (`Pick<MachineProps, ...>`)
 * keeps the machine's TSDoc. A callback named `on<Thing>` is an event, not a prop. Throws one error that lists every problem and writes nothing.
 *
 * @param projectRoot - The absolute folder of the package.
 * @param tsConfig - The absolute path of the package tsconfig.
 */
export function extractReactApiDocs(_root: string, projectRoot: string, tsConfig: string): ApiDocJson[] {
  const entries = srcEntryPointsOf(projectRoot);
  if (entries.length === 0) throw new Error(`${projectRoot} has no React entry point (src/<name>/index.ts)`);
  const program = createTsProgram(
    tsConfig,
    entries.map((entry) => entry.file),
  );
  const checker = program.getTypeChecker();
  const problems: string[] = [];
  const docs = entries.map(({ name, file }): ApiDocJson => {
    const source = program.getSourceFile(file);
    const components = source ? componentsOf(checker, source) : [];
    if (components.length === 0) problems.push(`${name}: the entry point exports no component`);
    const parts = components.map((component): ApiPartJson => {
      const { description: text, tags } = docOfSymbol(checker, component);
      const part = checkPartDoc(component.name, tags, text, problems);
      // A part other than the root carries its name in the semantic id of its members (`tabs.trigger.value`).
      const idScope = part === 'root' || part === '' ? name : `${name}.${part}`;
      const propsType = propsTypeOf(checker, component);
      // A props type that is a union (`type: 'single'` or `type: 'multiple'`) is read branch by branch and merged.
      const branches = propsType?.isUnion() ? propsType.types : propsType === undefined ? [] : [propsType];
      const membersOf = (list: readonly ts.Symbol[], asSlot: boolean): ApiMemberJson[] =>
        list
          .map((symbol) => propOf(program, checker, idScope, component.name, symbol, problems, asSlot))
          .filter((member): member is ApiMemberJson => member !== undefined);
      const perBranch = branches.map((branch) => branch.getProperties());
      const props = mergeBranches(
        perBranch.map((symbols) =>
          membersOf(
            symbols.filter((symbol) => !isSlot(symbol) && !isEvent(symbol)),
            false,
          ),
        ),
      );
      const events = mergeBranches(perBranch.map((symbols) => membersOf(symbols.filter(isEvent), false)));
      const slots =
        perBranch[0]?.filter(isSlot).flatMap((symbol): ApiSlotJson[] => {
          const [member] = membersOf([symbol], true);
          const fn = scopedSlotType(symbol);
          if (member === undefined) return [];
          return fn === undefined
            ? [member]
            : [
                placeAt(
                  {
                    ...member,
                    scope: scopeOf(
                      checker,
                      fn,
                      `${component.name}.${symbol.name}`,
                      problems,
                      tagsOfSymbol(checker, symbol),
                    ),
                  },
                  placeOf(member),
                ),
              ];
        }) ?? [];
      return {
        name: component.name,
        semanticId: `${name}.${part}`,
        anatomyPart: part,
        ...frameworkOnlyOf(component.name, tags, problems),
        description: paragraphsOf(text)[0] ?? '',
        ...partDocFields(text, tags),
        props,
        events,
        slots,
        methods: [],
      };
    });
    const partNames = new Set(parts.map((part) => `${part.name}Props`));
    const types =
      source === undefined
        ? []
        : exportedTypesOf(
            program,
            checker,
            source,
            name,
            (item) => partNames.has(item),
            problems,
            memberTypeTexts(parts),
          );
    return { component: name, framework: 'react', parts, ...(types.length > 0 ? { types } : {}) };
  });
  problems.push(...sharedTypeProblems(program));
  if (problems.length > 0) throw problemsError(problems);
  return docs;
}
