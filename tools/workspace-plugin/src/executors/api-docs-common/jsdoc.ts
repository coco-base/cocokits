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
