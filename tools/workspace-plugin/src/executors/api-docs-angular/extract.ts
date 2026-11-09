import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';
import { loadPackage } from '../load-module';
import { placeAt } from '../api-docs-common/places';
import { problemsError } from '../api-docs-common/run';
import type { ApiDocJson, ApiPartJson } from '../api-docs-common/types';
import { posix } from '../posix-path';
import { aliasResolverAt, aliasValuesOf, expandAliases, sharedTypeProblems } from '../api-docs-common/expand-alias';
import { exportedTypesOf, memberTypeTexts } from '../api-docs-common/exported-types';
import { docOfNode, docOfSymbol, tagLikeLineProblems } from '../api-docs-common/jsdoc';
import { defaultOf, partRemarksOf, portalSelectors, tagsOf } from '../api-docs-common/tags';
import { typeParameterDefaults, withDefaultArguments } from '../api-docs-common/generic';
import { contextGuardType, scopeOfType } from '../api-docs-common/scope';
import { partOf, type DocDirective, type ExpandedType } from './convert';
import { baseClassOf, publicMembersOf } from './members';
import { symbolsOf } from './symbols';

/** The part of `@angular/compiler-cli` this executor uses. */
interface NgtscProgramLike {
  getTsProgram(): ts.Program;
  getApiDocumentation(entryPoint: string, privateModules: Set<string>): { entries: DocEntry[] };
}

interface DocEntry {
  readonly entryType: string;
  readonly name: string;
  readonly source?: { readonly filePath: string };
}

interface CompilerCli {
  readConfiguration(project: string): {
    options: ts.CompilerOptions;
    rootNames: string[];
    errors: readonly ts.Diagnostic[];
  };
  createCompilerHost(context: { options: ts.CompilerOptions }): ts.CompilerHost;
  NgtscProgram: new (
    rootNames: readonly string[],
    options: ts.CompilerOptions,
    host: ts.CompilerHost,
  ) => NgtscProgramLike;
}

/** Folders of a package that are not entry points even when they hold an `index.ts` and an `ng-package.json`. */
const NOT_ENTRY_POINTS = new Set(['node_modules', 'dist', 'core']);

/** The Angular entry points of a package: the folders with an `ng-package.json` and an `index.ts`, by name. */
export function entryPointsOf(projectRoot: string): { name: string; file: string }[] {
  return readdirSync(projectRoot, { withFileTypes: true })
    .filter((item) => item.isDirectory() && !NOT_ENTRY_POINTS.has(item.name) && !item.name.startsWith('.'))
    .filter(
      (item) =>
        existsSync(join(projectRoot, item.name, 'ng-package.json')) &&
        existsSync(join(projectRoot, item.name, 'index.ts')),
    )
    .map((item) => ({ name: item.name, file: posix(join(projectRoot, item.name, 'index.ts')) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function createProgram(root: string, tsConfig: string): NgtscProgramLike {
  const cli = loadPackage(root, '@angular/compiler-cli') as CompilerCli;
  const config = cli.readConfiguration(posix(tsConfig));
  if (config.errors.length > 0) {
    const text = config.errors.map((error) => ts.flattenDiagnosticMessageText(error.messageText, '\n')).join('\n');
    throw new Error(`${tsConfig}: ${text}`);
  }
  return new cli.NgtscProgram(config.rootNames, config.options, cli.createCompilerHost({ options: config.options }));
}

/**
 * The source file of a docs entry. Angular reports `filePath` as the file name with the current directory cut off, so
 * it is relative to that directory (`/packages/...`) when the names are posix paths and absolute when they are not
 * (Windows).
 */
export function sourceFileOf(
  program: Pick<ts.Program, 'getSourceFile' | 'getCurrentDirectory'>,
  filePath: string,
): ts.SourceFile | undefined {
  const directory = posix(program.getCurrentDirectory()).replace(/\/$/, '');
  return program.getSourceFile(filePath) ?? program.getSourceFile(`${directory}${filePath}`);
}

function classNamed(program: ts.Program, entry: DocEntry): ts.ClassDeclaration | undefined {
  const file = entry.source ? sourceFileOf(program, entry.source.filePath) : undefined;
  return file?.statements.find(
    (statement): statement is ts.ClassDeclaration =>
      ts.isClassDeclaration(statement) && statement.name?.text === entry.name,
  );
}

/** The text with the characters that mean something in a regular expression escaped (an identifier may hold `$`). */
function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * The directive entry with the types of its members as the class sees them. The docs extractor prints a member
 * of a generic base class with the base's type parameter (`ValueChangeDetails<string, R>`); when a class in the
 * chain is generic, the type of a member that names a type parameter is read again from the checker, where the
 * parameter is the subclass's type argument.
 */
function withInstantiatedTypes(checker: ts.TypeChecker, cls: ts.ClassDeclaration, entry: DocDirective): DocDirective {
  const parameters: string[] = [];
  for (let current: ts.ClassDeclaration | undefined = cls; current; current = baseClassOf(checker, current)) {
    parameters.push(...(current.typeParameters ?? []).map((parameter) => parameter.name.text));
  }
  const mentionsParameter = (type: string): boolean =>
    parameters.some((name) => new RegExp(`\\b${escapeRegExp(name)}\\b`).test(type));
  const symbol = cls.name ? checker.getSymbolAtLocation(cls.name) : undefined;
  if (parameters.length === 0 || !symbol) return entry;
  // A generic component is read with the default of its type parameters (`T = string`).
  const defaults = typeParameterDefaults(cls.typeParameters);
  const instance = checker.getDeclaredTypeOfSymbol(symbol);
  const flags: ts.TypeFormatFlags =
    ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope;
  return {
    ...entry,
    members: entry.members.map((member) => {
      const property = checker.getPropertyOfType(instance, member.name);
      if (!property || member.type === undefined || !mentionsParameter(member.type)) return member;
      const type = checker.typeToString(checker.getTypeOfSymbolAtLocation(property, cls), cls, flags);
      return { ...member, type: withDefaultArguments(type, defaults) };
    }),
  };
}

/**
 * The directive entry with the text of the class and of its members read from the source ({@link docOfNode},
 * {@link docOfSymbol}), not from the docs extractor of the Angular compiler. That extractor reads one declaration with
 * the TypeScript parser, which cuts a text at an `@` that is no tag (`@click`) and loses the text of a `@param`
 * name, and it does not inherit the text of a base member as TypeScript does. A member that the class type does not
 * have gets no text, so the run reports it.
 */
function withSourceText(checker: ts.TypeChecker, cls: ts.ClassDeclaration, entry: DocDirective): DocDirective {
  const symbol = cls.name ? checker.getSymbolAtLocation(cls.name) : undefined;
  const instance = symbol ? checker.getDeclaredTypeOfSymbol(symbol) : undefined;
  const classDoc = docOfNode(cls);
  return {
    ...entry,
    description: classDoc.description,
    jsdocTags: classDoc.tags,
    members: entry.members.map((member) => {
      const doc = docOfSymbol(checker, instance?.getProperty(member.name));
      return { ...member, description: doc.description, jsdocTags: doc.tags };
    }),
  };
}

/** What a template directive says about itself: what shows without it, when it is used and an example. */
function templateDetailOf(directive: DocDirective): { default?: string; remarks?: string; examples?: string[] } {
  const fallback = defaultOf(directive.jsdocTags);
  const remarks = partRemarksOf(directive.description, directive.jsdocTags);
  const examples = tagsOf(directive.jsdocTags, 'example');
  return {
    ...(fallback === undefined ? {} : { default: fallback }),
    ...(remarks === undefined ? {} : { remarks }),
    ...(examples.length > 0 ? { examples } : {}),
  };
}

/**
 * Gives each slot whose selector is an `ng-template` the scope its directive declares: the type after `ctx is` in the
 * `static ngTemplateContextGuard` of the class with that selector.
 */
function withScopes(
  part: ApiPartJson,
  classes: readonly DocDirective[],
  program: ts.Program,
  owner: DocEntry,
  problems: string[],
): ApiPartJson {
  const slots = part.slots.map((slot) => {
    if (slot.selector?.startsWith('ng-template') !== true) return slot;
    const directive = classes.find((candidate) => candidate.selector.trim() === slot.selector);
    const entry = directive === undefined ? undefined : (directive as unknown as DocEntry);
    const cls = entry === undefined ? undefined : classNamed(program, entry);
    // The type parameter of the template directive is the component's own (`T` of the Select), so it takes the
    // default of the component.
    const detail = directive === undefined ? {} : templateDetailOf(directive);
    if (directive !== undefined)
      problems.push(
        ...tagLikeLineProblems(`${owner.name}.${slot.name}`, {
          description: directive.description,
          tags: directive.jsdocTags,
        }),
      );
    const scope =
      cls === undefined
        ? undefined
        : scopeOfType(
            contextGuardType(cls),
            `${owner.name}.${slot.name}`,
            problems,
            typeParameterDefaults(classNamed(program, owner)?.typeParameters),
          );
    return scope === undefined || scope.length === 0 ? { ...slot, ...detail } : { ...slot, ...detail, scope };
  });
  return { ...part, slots };
}

/**
 * The `ApiDoc` of every Angular entry point of a package, from its TSDoc. The Angular compiler's docs extractor
 * (`NgtscProgram.getApiDocumentation`) gives each exported directive and component with its selector, TSDoc tags
 * and members; the members of the classes it extends come from the type checker, through any base class, exported
 * or not. Throws one error that lists every problem (a missing TSDoc or `@cckPart`) and writes nothing.
 *
 * @param root - The workspace root.
 * @param projectRoot - The absolute folder of the package.
 * @param tsConfig - The absolute path of the package tsconfig.
 */
export function extractAngularApiDocs(root: string, projectRoot: string, tsConfig: string): ApiDocJson[] {
  const entries = entryPointsOf(projectRoot);
  if (entries.length === 0)
    throw new Error(`${projectRoot} has no Angular entry point (a folder with ng-package.json and index.ts)`);
  const program = createProgram(root, tsConfig);
  const tsProgram = program.getTsProgram();
  const checker = tsProgram.getTypeChecker();
  const problems: string[] = [];
  const docs = entries.map(({ name, file }): ApiDocJson => {
    const parts: ApiPartJson[] = [];
    const classes = program
      .getApiDocumentation(file, new Set())
      .entries.filter((entry) => entry.entryType === 'directive' || entry.entryType === 'component');
    // The template directives give their slot its text, so they are read to their end too.
    const wholeClasses = classes.map((entry) => {
      const cls = classNamed(tsProgram, entry);
      return cls ? withSourceText(checker, cls, entry as unknown as DocDirective) : (entry as unknown as DocDirective);
    });
    const portals = portalSelectors(wholeClasses);
    for (const entry of classes) {
      // A portal directive (`ng-template[cckPopoverPortal]`) renders no anatomy part, so it is no part.
      if (portals.has((entry as unknown as DocDirective).selector.trim())) continue;
      const cls = classNamed(tsProgram, entry);
      if (!cls) {
        problems.push(
          `${name}/${entry.name}: the class is not declared in ${entry.source?.filePath ?? 'a known file'}`,
        );
        continue;
      }
      if (ts.getCombinedModifierFlags(cls) & ts.ModifierFlags.Abstract) continue;
      const resolve = aliasResolverAt(tsProgram, cls);
      const expand = (type: string): ExpandedType => ({
        text: expandAliases(type, resolve),
        values: aliasValuesOf(type, resolve),
      });
      const doc = withSourceText(checker, cls, withInstantiatedTypes(checker, cls, entry as unknown as DocDirective));
      const part = partOf(name, doc, publicMembersOf(checker, cls), problems, expand);
      parts.push(placeAt(withScopes(part, wholeClasses, tsProgram, entry, problems), cls));
    }
    const sourceFile = tsProgram.getSourceFile(file);
    const partNames = new Set(classes.map((entry) => entry.name));
    const symbols = sourceFile === undefined ? [] : symbolsOf(checker, sourceFile, name, partNames, problems);
    const types =
      sourceFile === undefined
        ? []
        : exportedTypesOf(tsProgram, checker, sourceFile, name, () => false, problems, memberTypeTexts(parts, symbols));
    return {
      component: name,
      framework: 'angular',
      parts,
      ...(symbols.length > 0 ? { symbols } : {}),
      ...(types.length > 0 ? { types } : {}),
    };
  });
  problems.push(...sharedTypeProblems(tsProgram));
  if (problems.length > 0) throw problemsError(problems);
  return docs;
}
