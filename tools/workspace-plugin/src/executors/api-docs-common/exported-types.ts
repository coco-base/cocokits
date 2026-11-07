import ts from 'typescript';
import {
  aliasResolverAt,
  aliasValuesOf,
  expandAliases,
  isOwn,
  ownTypeNamed,
  type TypeDeclaration,
} from './expand-alias';
import { docTextOf, oneLine, tagsOfNode } from './jsdoc';
import { memberOf } from './member';
import { isInternal, paragraphsOf, valuesOf, withoutLinks } from './tags';
import type { ApiMemberJson, ApiPartJson, ApiSymbolJson, ApiTypeJson } from './types';

/** The documented fields of an interface: its own members, each with the type as written and its TSDoc. */
function fieldsOf(componentName: string, declaration: ts.InterfaceDeclaration, problems: string[]): ApiMemberJson[] {
  const fields: ApiMemberJson[] = [];
  for (const member of declaration.members) {
    if (!ts.isPropertySignature(member) && !ts.isMethodSignature(member)) continue;
    if (!ts.isIdentifier(member.name) && !ts.isStringLiteral(member.name)) continue;
    const tags = tagsOfNode(member);
    if (isInternal(tags)) continue;
    const required = member.questionToken === undefined;
    const written = ts.isPropertySignature(member)
      ? (member.type?.getText() ?? 'unknown')
      : `(${member.parameters.map((parameter) => parameter.getText()).join(', ')}) => ${member.type?.getText() ?? 'void'}`;
    const field = memberOf(
      componentName,
      { name: member.name.text, type: oneLine(written), required, description: docTextOf(member), tags },
      declaration.name.text,
      problems,
    );
    if (field !== undefined) fields.push(field);
  }
  return fields;
}

/** The Types row of a documented interface or alias, or undefined for an `@internal` or undocumented one. */
function typeRowOf(
  program: ts.Program,
  name: string,
  declaration: TypeDeclaration,
  componentName: string,
  problems: string[],
): ApiTypeJson | undefined {
  const tags = tagsOfNode(declaration);
  const [description] = paragraphsOf(docTextOf(declaration));
  if (isInternal(tags) || description === undefined) return undefined;
  const remarks = tags.filter((tag) => tag.name === 'remarks').map((tag) => withoutLinks(tag.comment.trim()));
  const base = { name, description, ...(remarks.length > 0 ? { remarks: remarks.join('\n\n') } : {}) };
  if (ts.isInterfaceDeclaration(declaration)) {
    return { kind: 'interface', ...base, fields: fieldsOf(componentName, declaration, problems) };
  }
  // An alias of an alias of string literals is written as its union, with the meanings of the inner alias.
  const resolve = aliasResolverAt(program, declaration);
  const written = oneLine(declaration.type.getText());
  const own = valuesOf(tags, name, problems);
  const values = own.length > 0 ? own : aliasValuesOf(written, resolve);
  return {
    kind: 'alias',
    ...base,
    text: expandAliases(written, resolve),
    fields: [],
    ...(values.length > 0 ? { values } : {}),
  };
}

/** The type names a type text writes, outside quoted text: the candidates for a Types row. */
const typeNamesIn = (text: string): string[] =>
  text.replace(/'[^']*'|"[^"]*"|`[^`]*`/g, '').match(/\b[A-Z][\w$]*\b/g) ?? [];

/** A type text to read names from, with the declaration whose scope it is written in (none for a member type). */
interface TypeText {
  readonly text: string;
  readonly at?: TypeDeclaration;
}

/** The type texts a Types row writes, in the scope of its declaration: the alias text and the field types. */
const textsOfRow = (row: ApiTypeJson, at: TypeDeclaration): TypeText[] =>
  [...(row.text === undefined ? [] : [row.text]), ...row.fields.map((field) => field.type)].map((text) => ({
    text,
    at,
  }));

/**
 * The own interface or alias a name stands for: in the scope of `at` when it is given, so a type parameter of the row
 * (`Reason` in `ChangeDetails<Reason>`) is none; else, or when the scope does not know the name, the program's type
 * of that name ({@link ownTypeNamed}).
 */
function typeNamed(program: ts.Program, name: string, at: TypeDeclaration | undefined): TypeDeclaration | null {
  const checker = program.getTypeChecker();
  const inScope =
    at === undefined
      ? undefined
      : checker
          .getSymbolsInScope(at, ts.SymbolFlags.Type | ts.SymbolFlags.Alias)
          .find((symbol) => symbol.name === name);
  if (inScope === undefined) return ownTypeNamed(program, name) ?? null;
  if (inScope.flags & ts.SymbolFlags.TypeParameter) return null;
  const target = inScope.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(inScope) : inScope;
  const declaration = target.declarations?.find(
    (item): item is TypeDeclaration => ts.isInterfaceDeclaration(item) || ts.isTypeAliasDeclaration(item),
  );
  return declaration !== undefined && isOwn(program, declaration) ? declaration : null;
}

/** The type texts of the members of the parts and symbols of an `ApiDoc`, slot scopes and constants included. */
export function memberTypeTexts(parts: readonly ApiPartJson[], symbols: readonly ApiSymbolJson[] = []): string[] {
  const members = [
    ...parts.flatMap((part) => [...part.props, ...part.events, ...part.slots, ...part.methods]),
    ...symbols.flatMap((symbol) => [...symbol.props, ...symbol.methods]),
  ];
  return [
    ...members.map((member) => member.type),
    ...parts.flatMap((part) => part.slots.flatMap((slot) => (slot.scope ?? []).map((field) => field.type))),
    ...symbols.flatMap((symbol) => (symbol.type === undefined ? [] : [symbol.type])),
  ];
}

/**
 * The interfaces and type aliases an entry point exports, with their TSDoc: an interface with its documented fields,
 * an alias with its type text and the meaning of its literals (`@cckValue`). A symbol with no TSDoc description, an
 * `@internal` one and the names `skip` refuses (the types the extractor already reads as a part's members) are left
 * out. A malformed tag adds a problem.
 *
 * A documented own type that a member type (`used`) or a row names, and that the entry point does not export, gets a
 * row too, so the page explains every type a member names (`OverlayVirtualAnchor`).
 *
 * @param componentName - The component, for the semantic ids of the fields.
 * @param skip - Whether a name is already shown as a part's members.
 * @param used - The type texts of the members ({@link memberTypeTexts}).
 */
export function exportedTypesOf(
  program: ts.Program,
  checker: ts.TypeChecker,
  file: ts.SourceFile,
  componentName: string,
  skip: (name: string) => boolean,
  problems: string[],
  used: readonly string[] = [],
): ApiTypeJson[] {
  const moduleSymbol = checker.getSymbolAtLocation(file);
  if (!moduleSymbol) return [];
  const result: ApiTypeJson[] = [];
  const texts: TypeText[] = used.map((text) => ({ text }));
  const seen = new Set<string>();
  for (const exported of checker.getExportsOfModule(moduleSymbol)) {
    seen.add(exported.name);
    const symbol = exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
    const declaration = symbol.declarations?.find(
      (item): item is TypeDeclaration => ts.isInterfaceDeclaration(item) || ts.isTypeAliasDeclaration(item),
    );
    if (declaration === undefined || skip(exported.name) || !isOwn(program, declaration)) continue;
    const row = typeRowOf(program, exported.name, declaration, componentName, problems);
    if (row === undefined) continue;
    result.push(row);
    texts.push(...textsOfRow(row, declaration));
  }
  for (let item = texts.shift(); item !== undefined; item = texts.shift()) {
    for (const name of typeNamesIn(item.text).filter((name) => !seen.has(name) && !skip(name))) {
      const declaration = typeNamed(program, name, item.at);
      if (declaration === null) continue;
      seen.add(name);
      const row = typeRowOf(program, name, declaration, componentName, problems);
      if (row === undefined) continue;
      result.push(row);
      texts.push(...textsOfRow(row, declaration));
    }
  }
  return result.sort((a, b) => a.name.localeCompare(b.name));
}
