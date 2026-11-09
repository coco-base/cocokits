import ts from 'typescript';
import { withDefaultArguments } from './generic';
import { docTextOf, tagLikeLineProblems, tagsOfNode } from './jsdoc';
import { checkParity, paragraphsOf } from './tags';
import type { ApiSlotJson } from './types';

type ScopeFields = NonNullable<ApiSlotJson['scope']>;

const docOf = (node: ts.Node): string => paragraphsOf(docTextOf(node))[0] ?? '';

/**
 * The scope a type literal declares, `{ /** The selected values. *\/ readonly selected: readonly string[] }`: one field
 * per member with its type text and its TSDoc. A field without TSDoc adds a problem, naming `owner`. A type parameter of
 * the component is written with its default (`readonly T[]` gives `readonly string[]`), as the members of a generic
 * component are. A field tagged `@cckSemantic none` exists in one framework by design and needs a `@cckParity`
 * reason, else a problem; it is written with `semanticId: 'none'`, as a member is.
 */
export function scopeOfType(
  literal: ts.TypeNode | undefined,
  owner: string,
  problems: string[],
  defaults: ReadonlyMap<string, string> = new Map(),
): ScopeFields | undefined {
  if (literal === undefined || !ts.isTypeLiteralNode(literal)) return undefined;
  const fields: ScopeFields = [];
  for (const member of literal.members) {
    if (!ts.isPropertySignature(member) || !ts.isIdentifier(member.name)) continue;
    const description = docOf(member);
    if (description === '') problems.push(`${owner}: the scope field "${member.name.text}" has no TSDoc description`);
    const tags = tagsOfNode(member);
    problems.push(
      ...tagLikeLineProblems(`${owner}: the scope field "${member.name.text}"`, {
        description: docTextOf(member),
        tags,
      }),
    );
    const frameworkOnly = checkParity(`${owner}: the scope field "${member.name.text}"`, tags, problems);
    fields.push({
      name: member.name.text,
      type: withDefaultArguments(member.type?.getText().replace(/\s+/g, ' ') ?? 'unknown', defaults),
      description,
      ...(frameworkOnly ? { semanticId: 'none' as const } : {}),
    });
  }
  return fields;
}

/** The type literal after `ctx is` in the `static ngTemplateContextGuard` of a directive class. */
export function contextGuardType(cls: ts.ClassDeclaration): ts.TypeNode | undefined {
  for (const member of cls.members) {
    if (ts.isMethodDeclaration(member) && member.name.getText() === 'ngTemplateContextGuard') {
      const type = member.type;
      return type !== undefined && ts.isTypePredicateNode(type) ? type.type : undefined;
    }
  }
  return undefined;
}

/** The parameter type literal of a slot declared as `name?(props: { … }): unknown` or `name: (props: { … }) => unknown`. */
function slotPropsType(member: ts.TypeElement): ts.TypeNode | undefined {
  const signature = ts.isMethodSignature(member)
    ? member
    : ts.isPropertySignature(member) && member.type && ts.isFunctionTypeNode(member.type)
      ? member.type
      : undefined;
  return signature?.parameters[0]?.type;
}

/**
 * The scope of each slot of the `defineSlots<{ … }>()` call in the script of a Vue component: the fields of the props
 * object of the slot, each with its TSDoc. A field without TSDoc adds a problem, naming `owner`. `defaults` are the
 * defaults of the type parameters of the component.
 */
export function vueSlotScopes(
  script: string,
  owner: string,
  problems: string[],
  defaults?: ReadonlyMap<string, string>,
): Map<string, ScopeFields> {
  const found = new Map<string, ScopeFields>();
  const source = ts.createSourceFile('slots.ts', script, ts.ScriptTarget.Latest, true);
  const visit = (node: ts.Node): void => {
    const literal =
      ts.isCallExpression(node) && node.expression.getText() === 'defineSlots' ? node.typeArguments?.[0] : undefined;
    if (literal !== undefined && ts.isTypeLiteralNode(literal)) {
      for (const member of literal.members) {
        const props = slotPropsType(member);
        const scope = scopeOfType(props, `${owner}.${member.name?.getText() ?? ''}`, problems, defaults);
        if (scope !== undefined && member.name !== undefined) found.set(member.name.getText(), scope);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return found;
}
