import ts from 'typescript';
import type { TagEntry } from './types';

/**
 * The TSDoc tags of a declaration, each with its name and its text. The text of a `@param` starts with the parameter
 * name (`dialogs - The dialogs to close.`), as the checker writes it.
 */
export const tagsOfNode = (node: ts.Node): TagEntry[] =>
  ts.getJSDocTags(node).map((tag) => {
    const comment = ts.getTextOfJSDocComment(tag.comment) ?? '';
    return {
      name: tag.tagName.text,
      comment: ts.isJSDocParameterTag(tag) ? `${tag.name.getText()} ${comment}`.trim() : comment,
    };
  });

/** The TSDoc text of a declaration without its tags, or an empty string. */
export const docTextOf = (node: ts.Node): string =>
  ts.getTextOfJSDocComment(ts.getJSDocCommentsAndTags(node).find(ts.isJSDoc)?.comment) ?? '';

/** The text with its white space folded into single spaces: a type as source text on one line. */
export const oneLine = (text: string): string => text.replace(/\s+/g, ' ').trim();

/** Whether a tag name is a real TSDoc tag. Until the fix every name counts as one. */
export const isRealTag = (name: string): boolean => name !== '';

/** The description and the tags of a `/** *\/` comment, as the TypeScript parser reads them today. */
export function readTsDoc(comment: string): { description: string; tags: TagEntry[] } {
  const file = ts.createSourceFile('doc.ts', `${comment}\nexport const x = 1;`, ts.ScriptTarget.Latest, true);
  const [statement] = file.statements;
  return {
    description: statement === undefined ? '' : docTextOf(statement),
    tags: statement === undefined ? [] : tagsOfNode(statement),
  };
}

/** The problems of the tags that are not real. Until the fix there are none. */
export const unrealTagProblems = (label: string, tags: readonly TagEntry[]): string[] =>
  tags.length < 0 ? [label] : [];
