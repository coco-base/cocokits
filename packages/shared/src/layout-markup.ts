import type {
  SnippetArgAttr,
  SnippetAttr,
  SnippetBlock,
  SnippetElement,
  SnippetNode,
  SnippetTextAttr,
} from './snippet';

/** The longest line, in columns, indent included. */
const MAX_COLUMNS = 120;
/** The indent of each nesting level, in spaces. */
const STEP = 2;

/**
 * Inline elements. Text inside them is never moved to a line of its own,
 * because a line break turns into a space in Angular and Vue and is dropped in React.
 */
const INLINE_TAGS: ReadonlySet<string> = new Set([
  'a',
  'abbr',
  'b',
  'cite',
  'code',
  'del',
  'dfn',
  'em',
  'i',
  'ins',
  'kbd',
  'label',
  'mark',
  'q',
  's',
  'samp',
  'small',
  'span',
  'strong',
  'sub',
  'sup',
  'time',
  'u',
  'var',
]);

/**
 * Trims the layout white space of a text: space, tab, line feed, carriage return and form feed. Other spaces,
 * U+00A0 above all, are characters the author wrote, so they stay.
 */
function trimLayout(text: string): string {
  return text.replace(/^[ \t\n\r\f]+|[ \t\n\r\f]+$/g, '');
}

/** An attribute after its arg is resolved: `text` is empty when nothing prints. */
export interface ResolvedAttr {
  readonly text: string;
  /** Whether the text follows a non-default arg. */
  readonly changed: boolean;
}

/** A line of laid-out markup. */
export interface LayoutLine {
  readonly text: string;
  /** Whether the line prints a non-default arg. */
  readonly changed: boolean;
}

/** Turns a text attribute of a template into the text to print. */
/** `hole` is true for an arg that is a node of the markup (a text hole), false for an attribute. */
export type AttrResolver = (attr: SnippetTextAttr, hole?: boolean) => ResolvedAttr;

/** A text of the markup once its holes are filled. `changed` is true when a hole printed text in it. */
type TextRun = ResolvedAttr;

/** A node ready to lay out: a text run or an element. */
type LaidNode = TextRun | SnippetElement;

function isElement(node: LaidNode): node is SnippetElement {
  return 'tag' in node;
}

function isRun(node: LaidNode): node is TextRun {
  return !isElement(node);
}

function isTextNode(node: SnippetNode): node is string | SnippetArgAttr {
  return typeof node === 'string' || !('tag' in node);
}

/**
 * The nodes of a list ready to lay out. A text hole is filled by `resolve` and counts as text. The texts around a hole
 * are one text with it (the text `{remaining} characters` is the same text whether the number is a hole or was
 * written), so a run of adjacent texts that holds a hole is one run; texts without a hole stay as they are. A text
 * that is empty is no node.
 */
function laid(nodes: readonly SnippetNode[], resolve: AttrResolver): LaidNode[] {
  const result: LaidNode[] = [];
  let group: (string | SnippetArgAttr)[] = [];
  const flush = (): void => {
    if (group.some((item) => typeof item !== 'string')) {
      const runs = group.map((item): TextRun =>
        typeof item === 'string' ? { text: item, changed: false } : resolve(item, true),
      );
      result.push({ text: runs.map((run) => run.text).join(''), changed: runs.some((run) => run.changed) });
    } else {
      for (const item of group) if (typeof item === 'string') result.push({ text: item, changed: false });
    }
    group = [];
  };
  for (const node of nodes) {
    if (isTextNode(node)) group.push(node);
    else {
      flush();
      result.push(node);
    }
  }
  flush();
  return result.filter((node) => isElement(node) || node.text !== '');
}

/**
 * An attribute ready to print. `text` is the inline form. A markup attribute also carries `block`, which lays its
 * markup out at the indent it prints at when the tag wraps. It stays inline only when its markup is one line
 * (`multiLine` is false) and the whole opening tag fits.
 */
interface LaidAttr extends ResolvedAttr {
  readonly name?: string;
  readonly multiLine?: boolean;
  readonly block?: (indent: number) => LayoutLine[];
}

interface OpenTag {
  readonly pad: string;
  readonly tag: string;
  readonly attrs: readonly LaidAttr[];
}

/** Resolves the attributes of an element and drops those that print nothing. */
function laidAttrs(attrs: readonly SnippetAttr[], resolve: AttrResolver): LaidAttr[] {
  const laid = attrs.map((attr): LaidAttr => {
    if (typeof attr === 'string' || !('markup' in attr)) return resolve(attr);
    const lines = layoutNodes(attr.markup, 0, resolve);
    if (lines.length === 0) return { text: '', changed: false };
    return {
      name: attr.name,
      multiLine: lines.length > 1,
      block: (indent) => layoutNodes(attr.markup, indent, resolve),
      changed: lines.some((line) => line.changed),
      text: `${attr.name}={${lines.length === 1 ? (lines[0]?.text ?? '') : ''}}`,
    };
  });
  return laid.filter((attr) => attr.text !== '');
}

/** The lines of one attribute in a wrapped opening tag; a markup attribute prints its markup one level deeper. */
function attrLines(attr: LaidAttr, indent: number): LayoutLine[] {
  const pad = ' '.repeat(indent);
  if (attr.block === undefined) return [{ text: `${pad}${attr.text}`, changed: attr.changed }];
  return [
    { text: `${pad}${attr.name ?? ''}={`, changed: false },
    ...attr.block(indent + STEP),
    { text: `${pad}}`, changed: false },
  ];
}

/**
 * Text beside elements, or text inside an inline element, is one inline run: it prints on one line, exactly as
 * written, because a line break would change the words that all three frameworks render.
 */
function isInlineRun(tag: string | undefined, nodes: readonly LaidNode[]): boolean {
  if (!nodes.some((node) => isRun(node) && node.text !== '')) return false;
  return nodes.some(isElement) || (tag !== undefined && INLINE_TAGS.has(tag));
}

interface Flat {
  readonly text: string;
  readonly changed: boolean;
}

/** An attribute on a single line; a markup attribute prints its markup in braces. */
function flatAttr(attr: SnippetAttr, resolve: AttrResolver): ResolvedAttr {
  if (typeof attr === 'string' || !('markup' in attr)) return resolve(attr);
  const run = flatRun(attr.markup, resolve);
  return { text: run.text === '' ? '' : `${attr.name}={${run.text}}`, changed: run.changed };
}

/** A conditional block on a single line: its lines, one after the other. */
function flatBlock(block: SnippetBlock, node: SnippetElement, resolve: AttrResolver): Flat {
  const content = flatRun(node.children, resolve);
  const other = node.otherwise === undefined ? undefined : flatRun(node.otherwise, resolve);
  const middle = other === undefined ? '' : `${block.middle}${other.text}`;
  return {
    text: `${block.open}${content.text}${middle}${block.close}`,
    changed: content.changed || other?.changed === true,
  };
}

/** A node on a single line, whatever its width. */
function flatNode(node: LaidNode, resolve: AttrResolver): Flat {
  if (isRun(node)) return node;
  if (node.conditionalLines !== undefined) return flatBlock(node.conditionalLines, node, resolve);
  const attrs = node.attrs.map((attr) => flatAttr(attr, resolve)).filter((attr) => attr.text !== '');
  const children = flatNodes(laid(node.children, resolve), resolve);
  const open = `<${node.tag}${attrs.map((attr) => ` ${attr.text}`).join('')}`;
  const changed = attrs.some((attr) => attr.changed) || children.changed;
  if (children.text === '') {
    return { text: node.selfClosing === true ? `${open} />` : `${open}></${node.tag}>`, changed };
  }
  return { text: `${open}>${children.text}</${node.tag}>`, changed };
}

/** Nodes on a single line, one after the other. */
function flatNodes(nodes: readonly LaidNode[], resolve: AttrResolver): Flat {
  const flat = nodes.map((node) => flatNode(node, resolve));
  return { text: flat.map((item) => item.text).join(''), changed: flat.some((item) => item.changed) };
}

function flatRun(nodes: readonly SnippetNode[], resolve: AttrResolver): Flat {
  return flatNodes(laid(nodes, resolve), resolve);
}

/** The opening tag on one line, ending in `tail`, when it fits in the line width. `changed`: a hole sits in the tail. */
function oneLine(open: OpenTag, tail: string, changed = false): LayoutLine | undefined {
  if (open.attrs.some((attr) => attr.multiLine === true)) return undefined;
  const text = `${open.pad}<${open.tag}${open.attrs.map((attr) => ` ${attr.text}`).join('')}${tail}`;
  if (text.length > MAX_COLUMNS) return undefined;
  return { text, changed: changed || open.attrs.some((attr) => attr.changed) };
}

/** The opening tag ending in `close`: on one line, or with one attribute per line when it does not fit. */
function openingLines(open: OpenTag, close: string): LayoutLine[] {
  const single = oneLine(open, close === '/>' ? ` ${close}` : close);
  if (single) return [single];
  return [
    { text: `${open.pad}<${open.tag}`, changed: false },
    ...open.attrs.flatMap((attr) => attrLines(attr, open.pad.length + STEP)),
    { text: `${open.pad}${close}`, changed: false },
  ];
}

/** An element that is no conditional block: a tag of its own, which a line break may stand next to. */
function isTagged(node: LaidNode): node is SnippetElement {
  return isElement(node) && node.conditionalLines === undefined;
}

/** Whether the element has children and all of them are elements (`svg`, `ul`): it prints them one per line. */
function hasOnlyElements(node: SnippetElement, resolve: AttrResolver): boolean {
  const children = laid(node.children, resolve);
  return children.length > 0 && children.every(isElement);
}

/** Whether the node prints on several lines whatever the width: an element of elements, or one that holds such. */
function forcesBlock(node: LaidNode, resolve: AttrResolver): node is SnippetElement {
  if (!isTagged(node)) return false;
  return hasOnlyElements(node, resolve) || laid(node.children, resolve).some((child) => forcesBlock(child, resolve));
}

/**
 * The nodes of an inline run in groups that stay on a line. A line break turns into a space in Angular and Vue and is
 * dropped in React, so it may only go between two elements with no text between them (all three frameworks drop the
 * white space between elements that holds a line break). A group ends where two tagged elements meet.
 */
function inlineGroups(nodes: readonly LaidNode[]): LaidNode[][] {
  const groups: LaidNode[][] = [];
  for (const node of nodes) {
    const group = groups.at(-1);
    const previous = group?.at(-1);
    if (group !== undefined && previous !== undefined && !(isTagged(previous) && isTagged(node))) group.push(node);
    else groups.push([node]);
  }
  return groups;
}

/** One group of an inline run at `indent`: text and flat elements on a line, an element of elements on several. */
function groupLines(group: readonly LaidNode[], indent: number, resolve: AttrResolver): LayoutLine[] {
  const lines: LayoutLine[] = [];
  let current: LayoutLine = { text: ' '.repeat(indent), changed: false };
  for (const node of group) {
    if (!forcesBlock(node, resolve)) {
      const flat = flatNode(node, resolve);
      current = { text: `${current.text}${flat.text}`, changed: current.changed || flat.changed };
      continue;
    }
    const [first, ...rest] = elementLines(node, indent, resolve);
    const last = rest.pop();
    lines.push({ text: `${current.text}${(first?.text ?? '').trimStart()}`, changed: current.changed });
    lines.push(...rest);
    current = last ?? { text: '', changed: false };
  }
  lines.push(current);
  return lines;
}

/**
 * Whether an inline run prints on one line: it fits the columns, or it has no place to break (one group and no element
 * of elements).
 */
function staysOnLine(nodes: readonly LaidNode[], single: LayoutLine, resolve: AttrResolver): boolean {
  if (single.text.length <= MAX_COLUMNS) return true;
  return inlineGroups(nodes).length === 1 && !nodes.some((node) => forcesBlock(node, resolve));
}

/**
 * An inline run in an element: the content follows the `>` on the same line and is never reflowed. A run wider than the
 * columns that holds an element of elements, or two elements side by side, breaks: after the opening tag when
 * the first node is an element, between two elements, and before the closing tag when the last node is an element.
 */
function inlineRunLines(open: OpenTag, children: readonly LaidNode[], resolve: AttrResolver): LayoutLine[] {
  const run = flatNodes(children, resolve);
  const lines = openingLines(open, '>');
  const last = lines.pop();
  if (last === undefined) return [];
  const single = { text: `${last.text}${run.text}</${open.tag}>`, changed: last.changed || run.changed };
  if (staysOnLine(children, single, resolve)) return [...lines, single];
  const inner = inlineGroups(children).flatMap((group) => groupLines(group, open.pad.length + STEP, resolve));
  const [first, ...rest] = inner;
  const [firstChild] = children;
  const body: LayoutLine[] =
    first === undefined || (firstChild !== undefined && isTagged(firstChild))
      ? [last, ...inner]
      : [{ text: `${last.text}${first.text.trimStart()}`, changed: last.changed || first.changed }, ...rest];
  const tail = body.pop();
  const lastChild = children.at(-1);
  if (tail === undefined || lastChild === undefined) return [...lines, single];
  const closing = `</${open.tag}>`;
  const end: LayoutLine[] = isTagged(lastChild)
    ? [tail, { text: `${open.pad}${closing}`, changed: false }]
    : [{ text: `${tail.text}${closing}`, changed: tail.changed }];
  return [...lines, ...body, ...end];
}

function emptyElementLines(open: OpenTag, selfClosing: boolean): LayoutLine[] {
  if (selfClosing) return openingLines(open, '/>');
  const single = oneLine(open, `></${open.tag}>`);
  if (single) return [single];
  return [...openingLines(open, '>'), { text: `${open.pad}</${open.tag}>`, changed: false }];
}

function elementLines(element: SnippetElement, indent: number, resolve: AttrResolver): LayoutLine[] {
  const attrs = laidAttrs(element.attrs, resolve);
  const children = laid(element.children, resolve);
  const open: OpenTag = { pad: ' '.repeat(indent), tag: element.tag, attrs };
  if (children.length === 0) return emptyElementLines(open, element.selfClosing === true);
  if (isInlineRun(element.tag, children)) return inlineRunLines(open, children, resolve);
  const runs = children.filter(isRun);
  if (runs.length === children.length) {
    const line = oneLine(
      open,
      `>${runs.map((run) => run.text).join(' ')}</${element.tag}>`,
      runs.some((run) => run.changed),
    );
    if (line) return [line];
  }
  return [
    ...openingLines(open, '>'),
    ...layoutLaid(children, indent + STEP, resolve),
    { text: `${open.pad}</${element.tag}>`, changed: false },
  ];
}

/** Whether a branch holds text of its own: on lines of its own, Angular would add spaces around it. */
function hasText(nodes: readonly SnippetNode[], resolve: AttrResolver): boolean {
  return laid(nodes, resolve).some(isRun);
}

/** A conditional block: its opening line, the content one level deeper, the `otherwise` content, its closing line. */
function blockLines(block: SnippetBlock, node: SnippetElement, indent: number, resolve: AttrResolver): LayoutLine[] {
  const pad = ' '.repeat(indent);
  const line = (text: string): LayoutLine => ({ text: `${pad}${text}`, changed: false });
  return [
    line(block.open),
    ...layoutNodes(node.children, indent + STEP, resolve),
    ...(node.otherwise === undefined
      ? []
      : [line(block.middle), ...layoutNodes(node.otherwise, indent + STEP, resolve)]),
    line(block.close),
  ];
}

/**
 * The block on one line when it names a one-line form (`flat`) and its content is one line that fits the columns: the
 * scoped-slot arrow `({ selected }) => <>…</>` of a React attribute.
 */
function singleLineBlock(
  block: SnippetBlock,
  node: SnippetElement,
  indent: number,
  resolve: AttrResolver,
): LayoutLine | undefined {
  if (block.flat === undefined || node.otherwise !== undefined) return undefined;
  const lines = layoutNodes(node.children, 0, resolve);
  const [only] = lines;
  if (lines.length !== 1 || only === undefined) return undefined;
  const text = `${' '.repeat(indent)}${block.flat.open}${only.text}${block.flat.close}`;
  return text.length > MAX_COLUMNS ? undefined : { text, changed: only.changed };
}

function nodeLines(node: LaidNode, indent: number, resolve: AttrResolver): LayoutLine[] {
  if (isRun(node)) {
    const text = trimLayout(node.text);
    return text === '' ? [] : [{ text: `${' '.repeat(indent)}${text}`, changed: node.changed }];
  }
  const lines = node.conditionalLines;
  if (lines === undefined) return elementLines(node, indent, resolve);
  if (hasText(node.children, resolve) || hasText(node.otherwise ?? [], resolve)) {
    const flat = flatBlock(lines, node, resolve);
    return [{ text: `${' '.repeat(indent)}${flat.text}`, changed: flat.changed }];
  }
  const single = singleLineBlock(lines, node, indent, resolve);
  return single === undefined ? blockLines(lines, node, indent, resolve) : [single];
}

function layoutLaid(nodes: readonly LaidNode[], indent: number, resolve: AttrResolver): LayoutLine[] {
  if (isInlineRun(undefined, nodes)) {
    const run = flatNodes(nodes, resolve);
    const single = { text: `${' '.repeat(indent)}${trimLayout(run.text)}`, changed: run.changed };
    if (staysOnLine(nodes, single, resolve)) return [single];
    const lines = inlineGroups(nodes).flatMap((group) => groupLines(group, indent, resolve));
    const last = lines.pop();
    return last === undefined ? lines : [...lines, { ...last, text: last.text.trimEnd() }];
  }
  return nodes.flatMap((node) => nodeLines(node, indent, resolve));
}

/**
 * Lays out snippet nodes line by line. Both `layoutMarkup` and `renderSnippet` use it, so the code the compiler
 * prints and the code the page fills follow one rule. A text hole is text: it is filled by `resolve`, laid out with the
 * texts around it, and marks every line it prints on.
 *
 * @param nodes - The markup.
 * @param indent - The spaces in front of each top-level node.
 * @param resolve - Turns each attribute and each text hole into its text.
 */
export function layoutNodes(nodes: readonly SnippetNode[], indent: number, resolve: AttrResolver): LayoutLine[] {
  return layoutLaid(laid(nodes, resolve), indent, resolve);
}

function resolveLiteral(attr: SnippetTextAttr): ResolvedAttr {
  if (typeof attr !== 'string') {
    throw new Error(
      `layoutMarkup: the attribute of arg "${attr.arg}" has no value; fill the template with renderSnippet.`,
    );
  }
  return { text: attr, changed: false };
}

/**
 * Lays out markup as text with the one layout rule of printed markup (indent, 120 columns, attribute wrapping,
 * text content, inline runs, `selfClosing`); the rule is owned by `playground-and-snippets.md`.
 *
 * Attributes must be plain text or markup: an arg attribute throws, because only `renderSnippet` knows the args.
 *
 * @param nodes - The markup.
 * @param indent - The spaces in front of each top-level node, counted in the 120 columns.
 * @returns The lines joined with `\n`, without a trailing line break.
 */
export function layoutMarkup(nodes: readonly SnippetNode[], indent: number): string {
  return layoutNodes(nodes, indent, resolveLiteral)
    .map((line) => line.text)
    .join('\n');
}
