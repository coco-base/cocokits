import ts from 'typescript';
import type { TagEntry } from './types';

/**
 * The block and modifier tags of `@microsoft/tsdoc` (`StandardTags.ts`, read 2026-11-09). The inline tags are left
 * out: they sit inside `{…}`, so no white space comes before their `@`.
 */
const STANDARD_TAGS: ReadonlySet<string> = new Set([
  'decorator',
  'defaultValue',
  'deprecated',
  'example',
  'param',
  'privateRemarks',
  'remarks',
  'returns',
  'see',
  'throws',
  'typeParam',
  'jsx',
  'jsxRuntime',
  'jsxFrag',
  'jsxImportSource',
  'alpha',
  'beta',
  'eventProperty',
  'experimental',
  'internal',
  'override',
  'packageDocumentation',
  'public',
  'readonly',
  'sealed',
  'virtual',
]);

/** Whether a tag name is a TSDoc standard tag or one of ours (`cck…`). Any other `@word` is text, such as `@click`. */
export const isRealTag = (tagName: string): boolean => STANDARD_TAGS.has(tagName) || tagName.startsWith('cck');

/** The tags that are not real tags: the sign that the TypeScript parser cut the text before them. */
export const unrealTagsOf = (tags: readonly TagEntry[]): TagEntry[] => tags.filter((tag) => !isRealTag(tag.name));

/** One problem per tag that is not real: a `@click` in a text was read as a tag, so the text before it was cut. */
export const unrealTagProblems = (label: string, tags: readonly TagEntry[]): string[] =>
  unrealTagsOf(tags).map((tag) => `${label}: "@${tag.name}" is not a TSDoc tag; the text before it was cut`);

/** The description and the tags of a declaration. */
export interface TsDocText {
  readonly description: string;
  readonly tags: readonly TagEntry[];
}

/** A real tag in a line: at the start or after white space, ending at white space or at the end of the line. */
const TAG_IN_LINE = /(^|\s)@([A-Za-z]\w*)(?=\s|$)/g;
const TAG_AT_START = /^@([A-Za-z]\w*)(?=\s|$)/;

/**
 * A line of a comment without its `*` margin: the text, the column where the text starts and the white space and `*`
 * before it (none on the first line).
 */
interface CommentLine {
  readonly text: string;
  readonly column: number | undefined;
  readonly prefix: string;
}

function linesOf(comment: string): CommentLine[] {
  const body = comment.replace(/^\s*\/\*\*/, '').replace(/\*\/\s*$/, '');
  return body.split(/\r?\n/).map((line, index) => {
    if (index === 0) return { text: line.trim(), column: undefined, prefix: '' };
    const [lead = '', star = '', gap = ''] = /^(\s*)(\*?)(\s*)/.exec(line)?.slice(1) ?? [];
    const column = lead.length + star.length + gap.length;
    return { text: line.slice(column).trimEnd(), column, prefix: line.slice(0, column) };
  });
}

/** A text under way: its lines, and the column that the TypeScript parser takes as its margin. */
interface Block {
  readonly name: string | undefined;
  readonly lines: string[];
  margin: number | undefined;
}

/** Adds the part of a line that starts the line: its indentation past the margin of the block is kept as written. */
function addLineStart(block: Block, line: CommentLine, text: string): void {
  const at = line.column ?? 0;
  if (text !== '') block.margin ??= at;
  const margin = block.margin ?? at;
  block.lines.push(text === '' ? '' : (at > margin ? line.prefix.slice(margin) : '') + text);
}

const joined = (lines: readonly string[]): string => lines.join('\n').trim();

/**
 * Reads the source text of a `/** *\/` comment into its description and its tags, each to its end. The TypeScript
 * parser ends a text at any ` @word` and so cuts a Vue event (`@click`) or an Angular block (`@Component`) written in
 * an example. Here only a real tag ({@link isRealTag}) ends a text. An `@example` runs to the next line that starts
 * with a real tag; every other text runs to the next real tag, wherever it is.
 */
export function readTsDoc(comment: string): TsDocText {
  const first: Block = { name: undefined, lines: [], margin: undefined };
  const blocks = [first];
  let current = first;
  for (const line of linesOf(comment)) {
    const { text, column } = line;
    if (current.name === 'example' && startingTagOf(text) === undefined) {
      addLineStart(current, line, text);
      continue;
    }
    let from = 0;
    for (const tag of realTagsIn(text)) {
      const before = text.slice(from, tag.start).trimEnd();
      if (from === 0) addLineStart(current, line, before);
      else current.lines.push(before);
      from = tag.end;
      current = blockAfter(tag.name, text.slice(from), (column ?? 0) + from);
      blocks.push(current);
      // The rest of an `@example` line is code.
      if (tag.name === 'example') break;
    }
    if (from === 0) addLineStart(current, line, text);
    else current.lines.push(text.slice(from).trim());
  }
  return {
    description: joined(first.lines),
    tags: blocks.slice(1).map((block) => ({ name: block.name ?? '', comment: joined(block.lines) })),
  };
}

/** The name of the real tag a line starts with, if any. */
function startingTagOf(text: string): string | undefined {
  const name = TAG_AT_START.exec(text)?.[1];
  return name !== undefined && isRealTag(name) ? name : undefined;
}

/** The real tags of a line, with where each starts (its `@`) and ends. */
function realTagsIn(text: string): { name: string; start: number; end: number }[] {
  return [...text.matchAll(TAG_IN_LINE)].flatMap((match) => {
    const name = match[2] ?? '';
    const start = match.index + (match[1] ?? '').length;
    // A code span on the line holds its text, as the TypeScript parser reads it.
    const inCodeSpan = text.slice(0, start).split('`').length % 2 === 0;
    return isRealTag(name) && !inCodeSpan ? [{ name, start: match.index, end: start + 1 + name.length }] : [];
  });
}

/** The block of a tag; `rest` is the text after its name on the line, which starts at `column`. */
function blockAfter(name: string, rest: string, column: number): Block {
  const margin = rest.trim() === '' ? undefined : column + rest.length - rest.trimStart().length;
  return { name, lines: [], margin };
}

/** The tags of a declaration as the TypeScript parser reads them. */
function parsedTagsOf(node: ts.Node): TagEntry[] {
  return ts.getJSDocTags(node).map((tag) => {
    const comment = ts.getTextOfJSDocComment(tag.comment) ?? '';
    return {
      name: tag.tagName.text,
      comment: ts.isJSDocParameterTag(tag) ? `${tag.name.getText()} ${comment}`.trim() : comment,
    };
  });
}

/**
 * The TSDoc of a declaration: its description (without its tags) and its tags, each with its name and its text. The
 * text of a `@param` starts with the parameter name (`dialogs - The dialogs to close.`), as the checker writes it.
 */
const docOfNode = (node: ts.Node): TsDocText =>
  wholeDocOf(
    {
      description: ts.getTextOfJSDocComment(ts.getJSDocCommentsAndTags(node).find(ts.isJSDoc)?.comment) ?? '',
      tags: parsedTagsOf(node),
    },
    [placeOfNode(node)],
  );

/** The TSDoc tags of a declaration, each with its name and its text; see {@link wholeDocOf}. */
export const tagsOfNode = (node: ts.Node): TagEntry[] => [...docOfNode(node).tags];

/** The TSDoc text of a declaration without its tags, or an empty string. */
export const docTextOf = (node: ts.Node): string => docOfNode(node).description;

/**
 * A declaration in a source file: where it starts (`position`, after its comment) in `text`. A TypeScript `file` of
 * that text can be given; else `text` is read as a `.ts` file or as a `.vue` file with a script.
 */
export interface SourcePlace {
  readonly text: string;
  readonly position: number;
  readonly file?: ts.SourceFile;
}

/**
 * The place of a declaration in its source file. The comment of a `const` is above its statement, not above the
 * declaration of the variable.
 */
export function placeOfNode(node: ts.Node): SourcePlace {
  const statement =
    ts.isVariableDeclaration(node) && ts.isVariableStatement(node.parent.parent) ? node.parent.parent : node;
  const file = node.getSourceFile();
  return { text: file.text, position: statement.getStart(), file };
}

const SCRIPT = new RegExp('<script[^>]*>([^]*?)</script>', 'g');
const parsedFiles = new Map<string, ts.SourceFile>();

/** The file to read for a place: the script block of a `.vue` text that holds the position, else the text. */
function fileOf({ text, position, file }: SourcePlace): { file: ts.SourceFile; offset: number } {
  if (file !== undefined) return { file, offset: 0 };
  let offset = 0;
  let code = text;
  for (const match of text.matchAll(SCRIPT)) {
    const start = match.index + match[0].indexOf('>') + 1;
    if (position >= start && position <= start + (match[1] ?? '').length) {
      offset = start;
      code = match[1] ?? '';
    }
  }
  const key = `${String(offset)}:${code}`;
  let parsed = parsedFiles.get(key);
  if (parsed === undefined) {
    parsed = ts.createSourceFile('doc.ts', code, ts.ScriptTarget.Latest, true);
    parsedFiles.set(key, parsed);
  }
  return { file: parsed, offset };
}

/** The last doc comment of the declaration that starts at the place, as written in the source. */
function docCommentAt(place: SourcePlace): string | undefined {
  const { file, offset } = fileOf(place);
  const position = place.position - offset;
  let found: readonly ts.JSDoc[] | undefined;
  const visit = (node: ts.Node): void => {
    if (position < node.pos || position >= node.end) return;
    const docs = (node as { jsDoc?: readonly ts.JSDoc[] }).jsDoc;
    if (docs !== undefined && docs.length > 0 && node.getStart(file) === position) found = docs;
    ts.forEachChild(node, visit);
  };
  visit(file);
  const doc = found?.[found.length - 1];
  return doc === undefined ? undefined : file.text.slice(doc.pos, doc.end);
}

/**
 * The description and tags a reader got from a parser (`parsedDoc`) that may have cut them at an `@` that is no tag.
 * They are read from the doc comment of the declaration at one of the `places` ({@link readTsDoc}); the parsed text is
 * kept when it has the same tags, so text that was not cut stays as the parser wrote it. Without a comment at any place
 * the parsed text stays, and the `api-docs` run reports a tag that is not real.
 */
export function wholeDocOf(parsedDoc: TsDocText, places: readonly SourcePlace[]): TsDocText {
  for (const place of places) {
    const comment = docCommentAt(place);
    if (comment === undefined) continue;
    const whole = readTsDoc(comment);
    const same =
      whole.tags.length === parsedDoc.tags.length &&
      whole.tags.every((tag, index) => tag.name === parsedDoc.tags[index]?.name);
    return same ? parsedDoc : whole;
  }
  return parsedDoc;
}

/** The text with its white space folded into single spaces: a type as source text on one line. */
export const oneLine = (text: string): string => text.replace(/\s+/g, ' ').trim();
