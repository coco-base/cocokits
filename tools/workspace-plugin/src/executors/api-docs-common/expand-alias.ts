import { dirname } from 'node:path/posix';
import ts from 'typescript';
import { posix } from '../posix-path';
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

/**
 * The union of string literals a type alias declares, as source text in declaration order, with the `@cckValue`
 * meanings of the alias, or undefined. An alias of such an alias (`type A = B`) stands for the same union and takes
 * the meanings of `B` when it has none of its own. A malformed tag is reported where the alias itself is extracted.
 */
function literalUnionOf(checker: ts.TypeChecker, symbol: ts.Symbol, depth = 0): LiteralAlias | undefined {
  const target = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
  const declaration = target.declarations?.find(ts.isTypeAliasDeclaration);
  if (declaration === undefined || declaration.typeParameters !== undefined) return undefined;
  const tags = ts
    .getJSDocTags(declaration)
    .map((tag) => ({ name: tag.tagName.text, comment: ts.getTextOfJSDocComment(tag.comment) ?? '' }));
  const own = valuesOf(tags, declaration.name.text, []);
  const inner = ts.isTypeReferenceNode(declaration.type)
    ? checker.getSymbolAtLocation(declaration.type.typeName)
    : undefined;
  if (inner !== undefined && depth < 5) {
    const aliased = literalUnionOf(checker, inner, depth + 1);
    return aliased && { text: aliased.text, values: own.length > 0 ? own : aliased.values };
  }
  const members = ts.isUnionTypeNode(declaration.type) ? declaration.type.types : [declaration.type];
  const literals = members.map((member) =>
    ts.isLiteralTypeNode(member) && ts.isStringLiteral(member.literal) ? member.literal.text : undefined,
  );
  if (literals.some((text) => text === undefined)) return undefined;
  return {
    text: literals.map((text) => `'${String(text).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`).join(' | '),
    values: own,
  };
}

/** Resolves a type name in the scope of a node to the union of string literals it stands for. */
export type AliasResolver = (typeName: string) => LiteralAlias | undefined;

const RESOLVERS = new WeakMap<ts.Node, AliasResolver>();

/** The resolver for the names visible at `location` (kept per node). */
export function aliasResolverAt(checker: ts.TypeChecker, location: ts.Node): AliasResolver {
  const known = RESOLVERS.get(location);
  if (known !== undefined) return known;
  const resolver = buildResolver(checker, location);
  RESOLVERS.set(location, resolver);
  return resolver;
}

function buildResolver(checker: ts.TypeChecker, location: ts.Node): AliasResolver {
  const scope = new Map(
    checker
      .getSymbolsInScope(location, ts.SymbolFlags.TypeAlias | ts.SymbolFlags.Alias)
      .map((symbol) => [symbol.name, symbol] as const),
  );
  const cache = new Map<string, LiteralAlias | undefined>();
  return (typeName) => {
    if (!cache.has(typeName)) {
      const symbol = scope.get(typeName);
      cache.set(typeName, symbol === undefined ? undefined : literalUnionOf(checker, symbol));
    }
    return cache.get(typeName);
  };
}

/** The members of a union written at the top level of the text, with their white space; brackets and quotes nest. */
function topLevelMembers(typeText: string): string[] {
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
