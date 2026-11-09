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

/** The text of a declaration that has none: no description and no tags, so the run reports a missing description. */
export const NO_DOC: TsDocText = { description: '', tags: [] };

const unique = <T>(items: readonly T[]): T[] => [...new Set(items)];

/**
 * The TSDoc of a declaration, read from the source with {@link readTsDoc}: the doc comments that TypeScript gives the
 * node (`ts.getJSDocCommentsAndTags`: only the last of stacked comments, and the comment of the initializer of a
 * variable first). The descriptions are joined by a line break without a repeat, and all tags are kept, as the
 * language service does for `getDocumentationComment` and `getJsDocTags`. The text of a `@param` starts with the
 * parameter name (`dialogs - The dialogs to close.`).
 */
export function docOfNode(node: ts.Node): TsDocText {
  const source = node.getSourceFile().text;
  const reads = ts
    .getJSDocCommentsAndTags(node)
    .filter(ts.isJSDoc)
    .map((doc) => readTsDoc(source.slice(doc.pos, doc.end)));
  return {
    description: unique(reads.map((read) => read.description).filter((text) => text !== '')).join('\n'),
    tags: reads.flatMap((read) => read.tags),
  };
}

/** The TSDoc tags of a declaration, each with its name and its text; see {@link docOfNode}. */
export const tagsOfNode = (node: ts.Node): TagEntry[] => [...docOfNode(node).tags];

/** The TSDoc text of a declaration without its tags, or an empty string. */
export const docTextOf = (node: ts.Node): string => docOfNode(node).description;

/**
 * The first result of `read` for the member of a declaration in the types that its class or interface extends and
 * implements, as the language service finds the base of a member (`findBaseOfDeclaration`).
 */
function inheritedFrom<T>(
  checker: ts.TypeChecker,
  declaration: ts.Declaration,
  memberName: string,
  readBase: (base: ts.Symbol) => T | undefined,
): T | undefined {
  const owner = ts.isConstructorDeclaration(declaration.parent) ? declaration.parent.parent : declaration.parent;
  if (!ts.isClassLike(owner) && !ts.isInterfaceDeclaration(owner)) return undefined;
  const isStatic =
    ts.canHaveModifiers(declaration) &&
    ts.getModifiers(declaration)?.some((modifier) => modifier.kind === ts.SyntaxKind.StaticKeyword) === true;
  for (const clause of owner.heritageClauses ?? []) {
    for (const superTypeNode of clause.types) {
      const baseType = checker.getTypeAtLocation(superTypeNode);
      const baseSymbol = baseType.getSymbol();
      const type = isStatic && baseSymbol ? checker.getTypeOfSymbol(baseSymbol) : baseType;
      const base = checker.getPropertyOfType(type, memberName);
      const result = base === undefined ? undefined : readBase(base);
      if (result !== undefined) return result;
    }
  }
  return undefined;
}

/**
 * Whether a symbol is declared outside the code of the package: in a `node_modules` folder (the default library files of TypeScript are there too).
 * Its text is never inherited (the same test as `isOwn` of `expand-alias.ts`, which needs a program).
 */
const isForeign = (symbol: ts.Symbol): boolean =>
  (symbol.declarations ?? []).some((declaration) => declaration.getSourceFile().fileName.includes('/node_modules/'));

/**
 * The TSDoc of a symbol over all its declarations and the types it inherits from, read from the source. It ports what
 * the language service does for `symbol.getDocumentationComment` and `symbol.getJsDocTags` (`getDocumentationComment`,
 * `getJsDocTagsOfDeclarations`, `findBaseOfDeclaration` of `services.ts`), so the parsers' text is never needed:
 *
 * - the declarations are unique, their descriptions are joined by a line break without a repeat, and their tags kept;
 * - with no description, each declaration takes the description of the same member of the first extended or
 *   implemented type that has the member, even with no text, and a later declaration's is put before it;
 * - with no tags, each declaration takes the tags of that member when the base member has one declaration, before
 *   its own.
 *
 * Deviation from TypeScript: the text of a base member declared outside the package (an interface of a `.d.ts` in
 * `node_modules`, such as `FormValueControl`) is never inherited, so a member that implements it still needs its own
 * text.
 *
 * Not ported: `{@inheritDoc}`, the accessor-pair variant and the `@param` text that TypeScript gives a parameter
 * declaration, which `packages/` does not use.
 */
export function docOfSymbol(checker: ts.TypeChecker, symbol: ts.Symbol | undefined): TsDocText {
  const declarations = unique(symbol?.declarations ?? []);
  if (symbol === undefined || declarations.length === 0) return NO_DOC;
  const ownDocs = declarations.map(docOfNode);
  let description = unique(ownDocs.map((doc) => doc.description).filter((text) => text !== '')).join('\n');
  let tags = ownDocs.flatMap((doc) => doc.tags);
  if (description === '') {
    const seen = new Set<ts.Symbol>();
    for (const declaration of declarations) {
      const inherited = inheritedFrom(checker, declaration, symbol.name, (base) => {
        if (seen.has(base) || isForeign(base)) return undefined;
        seen.add(base);
        return docOfSymbol(checker, base).description;
      });
      if (inherited !== undefined) description = description === '' ? inherited : `${inherited}\n${description}`;
    }
  }
  if (tags.length === 0) {
    const seen = new Set<ts.Symbol>();
    for (const declaration of declarations) {
      const inherited = inheritedFrom(checker, declaration, symbol.name, (base) => {
        if (seen.has(base) || isForeign(base)) return undefined;
        seen.add(base);
        return base.declarations?.length === 1 ? docOfSymbol(checker, base).tags : undefined;
      });
      if (inherited !== undefined) tags = [...inherited, ...tags];
    }
  }
  return { description, tags };
}

/**
 * One problem per line of a description or of the text of a tag other than `@example` that starts with a word that
 * looks like a tag (`@exmaple`) but is none: the author meant a tag, or wrote an `@` word without backticks.
 */
export function tagLikeLineProblems(label: string, doc: TsDocText): string[] {
  const texts = [doc.description, ...doc.tags.filter((tag) => tag.name !== 'example').map((tag) => tag.comment)];
  return unique(
    texts
      .flatMap((text) => text.split('\n'))
      .flatMap((line) => {
        const name = TAG_AT_START.exec(line.trimStart())?.[1];
        return name === undefined || isRealTag(name) ? [] : [name];
      }),
  ).map(
    (name) =>
      `${label}: a line starts with "@${name}", which is no TSDoc block or modifier tag and no cck tag; write it in backticks or fix the tag name`,
  );
}

/** The text with its white space folded into single spaces: a type as source text on one line. */
export const oneLine = (text: string): string => text.replace(/\s+/g, ' ').trim();
