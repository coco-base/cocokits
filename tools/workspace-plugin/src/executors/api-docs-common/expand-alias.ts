import { dirname } from 'node:path/posix';
import ts from 'typescript';
import { posix } from '../posix-path';
import { tagsOfNode } from './jsdoc';
import { valuesOf } from './tags';
import type { ApiValueJson } from './types';

/** A program over the given files with the compiler options of a tsconfig. */
export function createTsProgram(tsConfig: string, rootNames: readonly string[]): ts.Program {
  const file = ts.readConfigFile(tsConfig, (path) => ts.sys.readFile(path));
  if (file.error) throw new Error(`${tsConfig}: ${ts.flattenDiagnosticMessageText(file.error.messageText, '\n')}`);
  const config = ts.parseJsonConfigFileContent(file.config, ts.sys, dirname(posix(tsConfig)));
  if (config.errors.length > 0) {
    const text = config.errors.map((error) => ts.flattenDiagnosticMessageText(error.messageText, '\n')).join('\n');
    throw new Error(`${tsConfig}: ${text}`);
  }
  return ts.createProgram({ rootNames, options: { ...config.options, noEmit: true } });
}

/** An alias of string literals: its union as source text and the meanings its `@cckValue` tags give. */
export interface LiteralAlias {
  readonly text: string;
  readonly values: readonly ApiValueJson[];
}

/** The string literals of the type a type node stands for, when it is one string literal or a union of them. */
function computedLiterals(checker: ts.TypeChecker, node: ts.TypeNode): string[] | undefined {
  const type = checker.getTypeFromTypeNode(node);
  // A union keeps the order the checker made its literals in; the items of a list (`(typeof list)[number]`) keep theirs.
  const list =
    ts.isIndexedAccessTypeNode(node) && node.indexType.kind === ts.SyntaxKind.NumberKeyword
      ? checker.getTypeFromTypeNode(node.objectType)
      : undefined;
  const members =
    list !== undefined && checker.isTupleType(list)
      ? checker.getTypeArguments(list as ts.TypeReference)
      : type.isUnion()
        ? type.types
        : [type];
  const literals = members.flatMap((member) => (member.isStringLiteral() ? [member.value] : []));
  return literals.length === members.length ? literals : undefined;
}

/**
 * The union of string literals a type alias declares, as source text in declaration order, with the `@cckValue`
 * meanings of the alias, or undefined. An alias of such an alias (`type A = B`) stands for the same union and takes
 * the meanings of `B` when it has none of its own. A union the checker computes, such as the items of a `const` list
 * (`(typeof kinds)[number]`), counts too. A malformed tag is reported where the alias itself is extracted.
 */
function literalUnionOf(checker: ts.TypeChecker, symbol: ts.Symbol, depth = 0): LiteralAlias | undefined {
  const target = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
  const declaration = target.declarations?.find(ts.isTypeAliasDeclaration);
  if (declaration === undefined || declaration.typeParameters !== undefined) return undefined;
  const own = valuesOf(tagsOfNode(declaration), declaration.name.text, []);
  const inner = ts.isTypeReferenceNode(declaration.type)
    ? checker.getSymbolAtLocation(declaration.type.typeName)
    : undefined;
  if (inner !== undefined && depth < 5) {
    const aliased = literalUnionOf(checker, inner, depth + 1);
    return aliased && { text: aliased.text, values: own.length > 0 ? own : aliased.values };
  }
  const members = ts.isUnionTypeNode(declaration.type) ? declaration.type.types : [declaration.type];
  const written = members.map((member) =>
    ts.isLiteralTypeNode(member) && ts.isStringLiteral(member.literal) ? member.literal.text : undefined,
  );
  const literals = written.every((text) => text !== undefined) ? written : computedLiterals(checker, declaration.type);
  if (literals === undefined) return undefined;
  return {
    text: literals.map((text) => `'${text.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`).join(' | '),
    values: own,
  };
}

/** Resolves a type name in the scope of a node to the union of string literals it stands for. */
export type AliasResolver = (typeName: string) => LiteralAlias | undefined;

const RESOLVERS = new WeakMap<ts.Node, AliasResolver>();

/** Whether a declaration is part of the package or workspace (the DOM and `node_modules` types are not). */
export function isOwn(program: ts.Program, declaration: ts.Declaration): boolean {
  const file = declaration.getSourceFile();
  return !program.isSourceFileDefaultLibrary(file) && !posix(file.fileName).includes('/node_modules/');
}

/** An interface or a type alias: a declaration that can have a Types row. */
export type TypeDeclaration = ts.InterfaceDeclaration | ts.TypeAliasDeclaration;

interface OwnTypes {
  /** The declarations of each name; a source file hides the `.d.ts` files of the same name. */
  readonly byName: Map<string, TypeDeclaration[]>;
  /** The names a type text asked for that two declarations share. */
  readonly shared: Set<string>;
}

const OWN_TYPES = new WeakMap<ts.Program, OwnTypes>();

/** The top-level interfaces and type aliases of the program's own files, by name (see {@link ownTypeNamed}). */
function ownTypesOf(program: ts.Program): OwnTypes {
  const known = OWN_TYPES.get(program);
  if (known !== undefined) return known;
  const byName = new Map<string, TypeDeclaration[]>();
  for (const file of program.getSourceFiles()) {
    for (const statement of file.statements) {
      if (!(ts.isTypeAliasDeclaration(statement) || ts.isInterfaceDeclaration(statement))) continue;
      if (!isOwn(program, statement)) continue;
      byName.set(statement.name.text, [...(byName.get(statement.name.text) ?? []), statement]);
    }
  }
  for (const [name, declarations] of byName) {
    const sources = declarations.filter((declaration) => !declaration.getSourceFile().isDeclarationFile);
    if (sources.length > 0) byName.set(name, sources);
  }
  const types = { byName, shared: new Set<string>() };
  OWN_TYPES.set(program, types);
  return types;
}

/**
 * The interface or type alias of the program's own files with this name: a type text from the checker can name a type
 * the source never imports (`OverlaySide` for `TooltipSide`). A source file wins over a `.d.ts` file. Of a name that
 * several declarations share, the one in the folder of `near` wins (the local `RenderProp` of a component); else the
 * name stands for none of them, and {@link sharedTypeProblems} reports it.
 */
export function ownTypeNamed(program: ts.Program, name: string, near: ts.Node): TypeDeclaration | undefined {
  const types = ownTypesOf(program);
  const declarations = types.byName.get(name) ?? [];
  if (declarations.length <= 1) return declarations[0];
  const folder = dirname(posix(near.getSourceFile().fileName));
  const local = declarations.filter((declaration) => dirname(posix(declaration.getSourceFile().fileName)) === folder);
  if (local.length === 1) return local[0];
  types.shared.add(name);
  return undefined;
}

/**
 * One problem for each name a type text asked for that two own types share: the lookup by name cannot pick one, so
 * the member would lose its values or its Types row without a word. The extractors fail on it.
 */
export function sharedTypeProblems(program: ts.Program): string[] {
  const types = ownTypesOf(program);
  return [...types.shared].sort().map((name) => {
    const files = (types.byName.get(name) ?? []).map((declaration) => posix(declaration.getSourceFile().fileName));
    return `${name}: ${String(files.length)} types of the workspace have this name (${files.join(', ')}), so a type text that names it gets no values and no Types row; rename one`;
  });
}

/**
 * The resolver for the names visible at `location` (kept per node); a name not in scope is looked up among the aliases
 * of the program.
 */
export function aliasResolverAt(program: ts.Program, location: ts.Node): AliasResolver {
  const known = RESOLVERS.get(location);
  if (known !== undefined) return known;
  const resolver = buildResolver(program, location);
  RESOLVERS.set(location, resolver);
  return resolver;
}

/** The symbol of the program's own type alias with this name ({@link ownTypeNamed}), for a name not in scope. */
function programAliasNamed(program: ts.Program, name: string, near: ts.Node): ts.Symbol | undefined {
  const declaration = ownTypeNamed(program, name, near);
  return declaration !== undefined && ts.isTypeAliasDeclaration(declaration)
    ? program.getTypeChecker().getSymbolAtLocation(declaration.name)
    : undefined;
}

function buildResolver(program: ts.Program, location: ts.Node): AliasResolver {
  const checker = program.getTypeChecker();
  const scope = new Map(
    checker
      .getSymbolsInScope(location, ts.SymbolFlags.TypeAlias | ts.SymbolFlags.Alias)
      .map((symbol) => [symbol.name, symbol] as const),
  );
  const cache = new Map<string, LiteralAlias | undefined>();
  return (typeName) => {
    if (!cache.has(typeName)) {
      const symbol = scope.get(typeName) ?? programAliasNamed(program, typeName, location);
      cache.set(typeName, symbol === undefined ? undefined : literalUnionOf(checker, symbol));
    }
    return cache.get(typeName);
  };
}

/** The members of a union written at the top level of the text, with their white space; brackets and quotes nest. */
export function topLevelMembers(typeText: string): string[] {
  const members: string[] = [];
  let depth = 0;
  let quote = '';
  let start = 0;
  for (let at = 0; at < typeText.length; at += 1) {
    const char = typeText.charAt(at);
    if (quote !== '') {
      if (char === String.fromCharCode(92)) at += 1;
      else if (char === quote) quote = '';
    } else if (char === "'" || char === '"' || char === '`') quote = char;
    else if ('<([{'.includes(char)) depth += 1;
    else if ('>)]}'.includes(char) && !(char === '>' && typeText.charAt(at - 1) === '=')) depth -= 1;
    else if (char === '|' && depth === 0) {
      members.push(typeText.slice(start, at));
      start = at + 1;
    }
  }
  members.push(typeText.slice(start));
  return members;
}

/**
 * Replaces a member of the top-level union that is exactly the name of an alias of string literals by its union:
 * `BadgeContainerPosition | undefined` becomes `'top-left' | 'top-right' | … | undefined`. Any other text stays as written, so the
 * type keeps its meaning: arrays (`Position[]`), `keyof Position`, generic types (`Box<Position>`), member accesses,
 * object property keys and quoted text. A reader of the JSON then sees the real values and can
 * classify the prop.
 */
export function expandAliases(typeText: string, resolve: AliasResolver): string {
  return topLevelMembers(typeText)
    .map((member) => {
      const name = member.trim();
      const expanded = /^[A-Za-z_$][\w$]*$/.test(name) ? resolve(name)?.text : undefined;
      return expanded === undefined ? member : member.replace(name, expanded);
    })
    .join('|');
}

/**
 * The `@cckValue` meanings of the aliases {@link expandAliases} replaces in a type text, in order: a member typed by a
 * documented alias takes the meanings of its literals from the alias, so they are written once.
 */
export function aliasValuesOf(typeText: string, resolve: AliasResolver): ApiValueJson[] {
  return topLevelMembers(typeText).flatMap((member) => {
    const name = member.trim();
    return /^[A-Za-z_$][\w$]*$/.test(name) ? [...(resolve(name)?.values ?? [])] : [];
  });
}
