import ts from 'typescript';
import { posix } from '../posix-path';
import { memberOf } from './member';
import { isInternal, paragraphsOf, valuesOf, withoutLinks } from './tags';
import type { ApiMemberJson, ApiTypeJson, TagEntry } from './types';

const tagsOfNode = (node: ts.Node): TagEntry[] =>
  ts
    .getJSDocTags(node)
    .map((tag) => ({ name: tag.tagName.text, comment: ts.getTextOfJSDocComment(tag.comment) ?? '' }));

const docTextOf = (node: ts.Node): string =>
  ts.getTextOfJSDocComment(ts.getJSDocCommentsAndTags(node).find(ts.isJSDoc)?.comment) ?? '';

const oneLine = (text: string): string => text.replace(/\s+/g, ' ').trim();

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

/** Whether a declaration is part of the package or workspace (the DOM and `node_modules` types are not). */
const isOwn = (program: ts.Program, declaration: ts.Declaration): boolean => {
  const file = declaration.getSourceFile();
  return !program.isSourceFileDefaultLibrary(file) && !posix(file.fileName).includes('/node_modules/');
};

/**
 * The interfaces and type aliases an entry point exports, with their TSDoc: an interface with its documented fields,
 * an alias with its type text and the meaning of its literals (`@cckValue`). A symbol with no TSDoc description, an
 * `@internal` one and the names `skip` refuses (the types the extractor already reads as a part's members) are left
 * out. A malformed tag adds a problem.
 *
 * @param componentName - The component, for the semantic ids of the fields.
 * @param skip - Whether a name is already shown as a part's members.
 */
export function exportedTypesOf(
  program: ts.Program,
  checker: ts.TypeChecker,
  file: ts.SourceFile,
  componentName: string,
  skip: (name: string) => boolean,
  problems: string[],
): ApiTypeJson[] {
  const moduleSymbol = checker.getSymbolAtLocation(file);
  if (!moduleSymbol) return [];
  const result: ApiTypeJson[] = [];
  for (const exported of checker.getExportsOfModule(moduleSymbol)) {
    const symbol = exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
    const declaration = symbol.declarations?.find(
      (item): item is ts.InterfaceDeclaration | ts.TypeAliasDeclaration =>
        ts.isInterfaceDeclaration(item) || ts.isTypeAliasDeclaration(item),
    );
    if (declaration === undefined || skip(exported.name) || !isOwn(program, declaration)) continue;
    const tags = tagsOfNode(declaration);
    const [description] = paragraphsOf(docTextOf(declaration));
    if (isInternal(tags) || description === undefined) continue;
    const remarks = tags.filter((tag) => tag.name === 'remarks').map((tag) => withoutLinks(tag.comment.trim()));
    const base = {
      name: exported.name,
      description,
      ...(remarks.length > 0 ? { remarks: remarks.join('\n\n') } : {}),
    };
    if (ts.isInterfaceDeclaration(declaration)) {
      result.push({ kind: 'interface', ...base, fields: fieldsOf(componentName, declaration, problems) });
      continue;
    }
    const values = valuesOf(tags, exported.name, problems);
    result.push({
      kind: 'alias',
      ...base,
      text: oneLine(declaration.type.getText()),
      fields: [],
      ...(values.length > 0 ? { values } : {}),
    });
  }
  return result.sort((a, b) => a.name.localeCompare(b.name));
}
