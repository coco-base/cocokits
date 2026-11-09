import ts from 'typescript';
import {
  aliasResolverAt,
  aliasValuesOf,
  expandAliases,
  isOwn,
  ownTypeNamed,
  type TypeDeclaration,
} from './expand-alias';
import { docTextOf, oneLine, tagsOfNode, unrealTagProblems } from './jsdoc';
import { memberOf, withoutUndefined } from './member';
import { placeOf } from './places';
import { isInternal, paragraphsOf, paramRemarksOf, tagsOf, valuesOf, withoutLinks } from './tags';
import type { ApiMemberJson, ApiPartJson, ApiSymbolJson, ApiTypeJson, TagEntry } from './types';

/** The documented fields an interface declares itself, each with the type as written and its TSDoc. */
function ownFieldsOf(componentName: string, declaration: ts.InterfaceDeclaration, problems: string[]): ApiMemberJson[] {
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

const INHERITED_TYPE_FLAGS: ts.TypeFormatFlags =
  ts.TypeFormatFlags.NoTruncation |
  ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope |
  ts.TypeFormatFlags.UseSingleQuotesForStringLiteralType;

/** The field of an interface that a base declares, as the checker sees it on the interface. */
function inheritedFieldOf(
  program: ts.Program,
  componentName: string,
  declaration: ts.InterfaceDeclaration,
  property: ts.Symbol,
  source: ts.Declaration,
  problems: string[],
): ApiMemberJson | undefined {
  const tags = tagsOfNode(source);
  if (isInternal(tags)) return undefined;
  const checker = program.getTypeChecker();
  const resolve = aliasResolverAt(program, declaration);
  const required = (property.flags & ts.SymbolFlags.Optional) === 0;
  const read = checker.typeToString(
    checker.getTypeOfSymbolAtLocation(property, declaration),
    declaration,
    INHERITED_TYPE_FLAGS,
  );
  return memberOf(
    componentName,
    {
      name: property.name,
      type: withoutUndefined(expandAliases(read, resolve), required),
      required,
      description: docTextOf(source),
      tags,
      aliasValues: aliasValuesOf(read, resolve),
    },
    declaration.name.text,
    problems,
  );
}

/**
 * The own interface a heritage type stands for, through `Omit`, `Pick` and the like, with the utility types around it:
 * `wrap` writes a native base of the interface inside them (`Omit<Base, 'id'>` gives `Omit<<native>, 'id'>`).
 */
function ownInterfaceOf(
  program: ts.Program,
  node: ts.ExpressionWithTypeArguments | ts.TypeNode,
): { declaration: ts.InterfaceDeclaration; wrap: (native: string) => string } | undefined {
  if (!ts.isExpressionWithTypeArguments(node) && !ts.isTypeReferenceNode(node)) return undefined;
  const checker = program.getTypeChecker();
  const head = ts.isExpressionWithTypeArguments(node) ? node.expression : node.typeName;
  const symbol = checker.getSymbolAtLocation(head);
  const target =
    symbol !== undefined && symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
  const declaration = target?.declarations?.find(ts.isInterfaceDeclaration);
  if (declaration !== undefined)
    return isOwn(program, declaration) ? { declaration, wrap: (native) => native } : undefined;
  // A utility type of the library (`Omit<Base, 'id'>`) stands for its first type argument.
  const [first, ...rest] = node.typeArguments ?? [];
  const inner = first === undefined ? undefined : ownInterfaceOf(program, first);
  if (inner === undefined) return undefined;
  const others = rest.map((argument) => `, ${oneLine(argument.getText())}`).join('');
  return { declaration: inner.declaration, wrap: (native) => `${head.getText()}<${inner.wrap(native)}${others}>` };
}

/**
 * The bases outside the workspace that an interface extends, directly or through its own bases, as written: the
 * native attributes it has. An own base is never named; the native bases it extends are, inside the `Omit` or `Pick`
 * that the own base sits in. TypeScript rejects a base that extends itself, so the walk ends.
 */
function nativeBasesOf(program: ts.Program, declaration: ts.InterfaceDeclaration): string[] {
  const checker = program.getTypeChecker();
  return (declaration.heritageClauses ?? []).flatMap((clause) =>
    clause.types.flatMap((base) => {
      const own = ownInterfaceOf(program, base);
      if (own !== undefined) return nativeBasesOf(program, own.declaration).map(own.wrap);
      const native = checker
        .getPropertiesOfType(checker.getTypeAtLocation(base))
        .some((property) => property.declarations?.some((item) => !isOwn(program, item)) ?? true);
      return native ? [oneLine(base.getText())] : [];
    }),
  );
}

/**
 * The fields of an interface: its own, then the documented fields of its own bases, as the checker sees them on the
 * interface (an `Omit`ted key is gone, a type argument is filled in). A field a base outside the workspace declares
 * (`HTMLAttributes`) is left out; {@link nativeBasesOf} names those bases.
 */
function fieldsOf(
  program: ts.Program,
  componentName: string,
  declaration: ts.InterfaceDeclaration,
  problems: string[],
): ApiMemberJson[] {
  const fields = ownFieldsOf(componentName, declaration, problems);
  const checker = program.getTypeChecker();
  const listed = new Set(fields.map((field) => field.name));
  for (const base of (declaration.heritageClauses ?? []).flatMap((clause) => clause.types)) {
    for (const property of checker.getPropertiesOfType(checker.getTypeAtLocation(base))) {
      const source = property.declarations?.find((item) => ts.isPropertySignature(item) || ts.isMethodSignature(item));
      if (source === undefined || !isOwn(program, source) || listed.has(property.name)) continue;
      listed.add(property.name);
      const field = inheritedFieldOf(program, componentName, declaration, property, source, problems);
      if (field !== undefined) fields.push(field);
    }
  }
  return fields;
}

/**
 * What each type parameter of a generic row stands for: its `@typeParam` text, else where you write it, with its
 * constraint and its default. Without it, a field typed `Reason` would name a type the page never defines.
 */
function typeParamRemarksOf(name: string, declaration: TypeDeclaration, tags: readonly TagEntry[]): string[] {
  const written = paramRemarksOf(tags, 'typeParam');
  const parameters = declaration.typeParameters ?? [];
  const usage = `\`${name}<${parameters.map((parameter) => parameter.name.text).join(', ')}>\``;
  return parameters.map((parameter) => {
    const own = written.find((line) => line.startsWith(`\`${parameter.name.text}\`:`));
    if (own !== undefined) return own;
    const constraint =
      parameter.constraint === undefined ? '' : ` It must be a \`${oneLine(parameter.constraint.getText())}\`.`;
    const fallback =
      parameter.default === undefined ? '' : ` When not set, it is \`${oneLine(parameter.default.getText())}\`.`;
    return `\`${parameter.name.text}\`: the type you write in its place in ${usage}.${constraint}${fallback}`;
  });
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
  problems.push(...unrealTagProblems(name, tags));
  // A Types row has no example; the members that use the type show one.
  if (tagsOf(tags, 'example').length > 0) {
    problems.push(`${name}: a Types row cannot show an @example; put it on a member that uses the type`);
  }
  const remarks = [
    ...tags.filter((tag) => tag.name === 'remarks').map((tag) => withoutLinks(tag.comment.trim())),
    ...typeParamRemarksOf(name, declaration, tags),
  ];
  const natives = ts.isInterfaceDeclaration(declaration) ? [...new Set(nativeBasesOf(program, declaration))] : [];
  if (natives.length > 0) {
    remarks.push(`It also has the native attributes of ${natives.map((native) => `\`${native}\``).join(', ')}.`);
  }
  const base = { name, description, ...(remarks.length > 0 ? { remarks: remarks.join('\n\n') } : {}) };
  if (ts.isInterfaceDeclaration(declaration)) {
    return { kind: 'interface', ...base, fields: fieldsOf(program, componentName, declaration, problems) };
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
export interface TypeText {
  readonly text: string;
  readonly at?: ts.Node | undefined;
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
function typeNamed(
  program: ts.Program,
  name: string,
  at: ts.Node | undefined,
  entry: ts.SourceFile,
): TypeDeclaration | null {
  const checker = program.getTypeChecker();
  const inScope =
    at === undefined
      ? undefined
      : checker
          .getSymbolsInScope(at, ts.SymbolFlags.Type | ts.SymbolFlags.Alias)
          .find((symbol) => symbol.name === name);
  if (inScope === undefined) return ownTypeNamed(program, name, at ?? entry) ?? null;
  if (inScope.flags & ts.SymbolFlags.TypeParameter) return null;
  const target = inScope.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(inScope) : inScope;
  const declaration = target.declarations?.find(
    (item): item is TypeDeclaration => ts.isInterfaceDeclaration(item) || ts.isTypeAliasDeclaration(item),
  );
  return declaration !== undefined && isOwn(program, declaration) ? declaration : null;
}

/** The type texts of the members of the parts and symbols of an `ApiDoc`, slot scopes and constants included. */
export function memberTypeTexts(parts: readonly ApiPartJson[], symbols: readonly ApiSymbolJson[] = []): TypeText[] {
  // Each text is read where its member was declared ({@link placeAt}), else where its part or symbol was.
  const of = (owner: object, member: { type: string }): TypeText => ({
    text: member.type,
    at: placeOf(member) ?? placeOf(owner),
  });
  return [
    ...parts.flatMap((part) => [...part.props, ...part.events, ...part.slots, ...part.methods].map((m) => of(part, m))),
    ...parts.flatMap((part) => part.slots.flatMap((slot) => (slot.scope ?? []).map((field) => of(slot, field)))),
    ...symbols.flatMap((symbol) => [...symbol.props, ...symbol.methods].map((m) => of(symbol, m))),
    ...symbols.flatMap((symbol) => (symbol.type === undefined ? [] : [of(symbol, { type: symbol.type })])),
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
  used: readonly TypeText[] = [],
): ApiTypeJson[] {
  const moduleSymbol = checker.getSymbolAtLocation(file);
  if (!moduleSymbol) return [];
  const result: ApiTypeJson[] = [];
  const texts: TypeText[] = [...used];
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
      const declaration = typeNamed(program, name, item.at, file);
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
