import ts from 'typescript';
import { memberOf } from '../api-docs-common/member';
import { isInternal, paragraphsOf, tagsOf, withoutLinks } from '../api-docs-common/tags';
import type { ApiMemberJson, ApiSymbolJson, TagEntry } from '../api-docs-common/types';

const tagsOfNode = (node: ts.Node): TagEntry[] =>
  ts
    .getJSDocTags(node)
    .map((tag) => ({ name: tag.tagName.text, comment: ts.getTextOfJSDocComment(tag.comment) ?? '' }));

const docTextOf = (node: ts.Node): string =>
  ts.getTextOfJSDocComment(ts.getJSDocCommentsAndTags(node).find(ts.isJSDoc)?.comment) ?? '';

const oneLine = (text: string): string => text.replace(/\s+/g, ' ').trim();

const decoratorNames = (node: ts.ClassDeclaration): string[] =>
  (ts.getDecorators(node) ?? []).map((decorator) => {
    const expression = ts.isCallExpression(decorator.expression)
      ? decorator.expression.expression
      : decorator.expression;
    return expression.getText();
  });

/** Whether a class member is public API: not private, protected, static-internal, `_`-named or `@internal`. */
function isPublicMember(member: ts.ClassElement, tags: readonly TagEntry[]): boolean {
  const flags = ts.getCombinedModifierFlags(member);
  const name = member.name?.getText() ?? '';
  return (
    (flags & (ts.ModifierFlags.Private | ts.ModifierFlags.Protected)) === 0 &&
    !name.startsWith('_') &&
    !name.startsWith('#') &&
    !isInternal(tags)
  );
}

/** The type text of a property, a getter or a method (as a function type). */
function memberTypeOf(member: ts.MethodDeclaration | ts.PropertyDeclaration | ts.GetAccessorDeclaration): string {
  if (!ts.isMethodDeclaration(member)) return member.type?.getText() ?? 'unknown';
  const parameters = member.parameters.map((parameter) => parameter.getText()).join(', ');
  return `(${parameters}) => ${member.type?.getText() ?? 'void'}`;
}

/** The documented public properties and methods a class declares itself. */
function membersOfClass(
  componentName: string,
  declaration: ts.ClassDeclaration,
): { props: ApiMemberJson[]; methods: ApiMemberJson[] } {
  const props: ApiMemberJson[] = [];
  const methods: ApiMemberJson[] = [];
  const problems: string[] = [];
  for (const member of declaration.members) {
    if (!ts.isMethodDeclaration(member) && !ts.isPropertyDeclaration(member) && !ts.isGetAccessorDeclaration(member)) {
      continue;
    }
    const tags = tagsOfNode(member);
    if (!isPublicMember(member, tags)) continue;
    const item = memberOf(
      componentName,
      {
        name: member.name.getText(),
        type: oneLine(memberTypeOf(member)),
        required: !(ts.isPropertyDeclaration(member) && member.questionToken !== undefined),
        description: docTextOf(member),
        tags,
      },
      declaration.name?.text ?? 'class',
      problems,
    );
    if (item !== undefined) (ts.isMethodDeclaration(member) ? methods : props).push(item);
  }
  return { props, methods };
}

/** The type of a constant as the reader writes it: the token's value type, the parts of an imports list, else the checker's. */
function constantTypeOf(checker: ts.TypeChecker, declaration: ts.VariableDeclaration): string {
  let initializer = declaration.initializer;
  while (initializer !== undefined && (ts.isAsExpression(initializer) || ts.isParenthesizedExpression(initializer))) {
    initializer = initializer.expression;
  }
  if (
    initializer !== undefined &&
    ts.isNewExpression(initializer) &&
    initializer.expression.getText() === 'InjectionToken' &&
    initializer.typeArguments?.[0] !== undefined
  ) {
    return oneLine(initializer.typeArguments[0].getText());
  }
  if (initializer !== undefined && ts.isArrayLiteralExpression(initializer)) {
    return `readonly [${initializer.elements.map((element) => element.getText()).join(', ')}]`;
  }
  return oneLine(
    checker.typeToString(checker.getTypeAtLocation(declaration), declaration, ts.TypeFormatFlags.NoTruncation),
  );
}

/** The class (a service or a class; none for a directive, a component or a pipe) or the constant a declaration stands for. */
function symbolOf(
  checker: ts.TypeChecker,
  declaration: ts.ClassDeclaration | ts.VariableDeclaration,
  componentName: string,
  base: Pick<ApiSymbolJson, 'name' | 'description' | 'remarks' | 'examples'>,
): ApiSymbolJson | undefined {
  if (ts.isVariableDeclaration(declaration)) {
    return { kind: 'constant', ...base, type: constantTypeOf(checker, declaration), props: [], methods: [] };
  }
  const decorators = decoratorNames(declaration);
  if (decorators.some((name) => name === 'Component' || name === 'Directive' || name === 'Pipe')) return undefined;
  return {
    kind: decorators.includes('Injectable') ? 'service' : 'class',
    ...base,
    ...membersOfClass(componentName, declaration),
  };
}

/**
 * The services, classes and constants an Angular entry point exports besides its parts: an `@Injectable` class is a
 * service, another class a class, a `const` a constant. A symbol with no TSDoc description and an `@internal` one are
 * left out, and so is a directive or component (those are parts).
 *
 * @param partNames - The names of the exported directives and components.
 */
export function symbolsOf(
  checker: ts.TypeChecker,
  file: ts.SourceFile,
  componentName: string,
  partNames: ReadonlySet<string>,
): ApiSymbolJson[] {
  const moduleSymbol = checker.getSymbolAtLocation(file);
  if (!moduleSymbol) return [];
  const result: ApiSymbolJson[] = [];
  for (const exported of checker.getExportsOfModule(moduleSymbol)) {
    if (partNames.has(exported.name)) continue;
    const symbol = exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
    const declaration = symbol.declarations?.find(
      (item): item is ts.ClassDeclaration | ts.VariableDeclaration =>
        ts.isClassDeclaration(item) || ts.isVariableDeclaration(item),
    );
    if (declaration === undefined || declaration.getSourceFile().fileName.includes('/node_modules/')) continue;
    const tags = tagsOfNode(declaration);
    const [description] = paragraphsOf(docTextOf(declaration));
    if (isInternal(tags) || description === undefined) continue;
    const remarks = tagsOf(tags, 'remarks').map(withoutLinks);
    const examples = tagsOf(tags, 'example');
    const base = {
      name: exported.name,
      description,
      ...(remarks.length > 0 ? { remarks: remarks.join('\n\n') } : {}),
      ...(examples.length > 0 ? { examples } : {}),
    };
    const item = symbolOf(checker, declaration, componentName, base);
    if (item !== undefined) result.push(item);
  }
  return result;
}
