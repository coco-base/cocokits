import type { StoryValue } from './story';

/**
 * An attribute that depends on an arg of a story (the playground, or a custom story with args). The printed text is chosen by the arg's value.
 *
 * - `select` and `switch` args set `values`: the printed text per value (`String(value)` is the key). A value that
 *   is missing from `values`, and a default value, print nothing; give the default `''`.
 * - `text` and `number` args set `before` and `after`: they surround the escaped value. `default` is the value
 *   that prints nothing, `kind` and `escape` say how the value is checked and escaped.
 * - As a node of the markup (a text hole) an arg is the text of an element: `{maxLength}`. A hole uses neither `before`,
 *   `after` nor `default`, and `escape` is `text` (React, Vue) or `angular` (an Angular template). Any value that prints
 *   text marks its line; a null, missing or empty value, or a value of only spaces, tabs or line breaks, prints and marks nothing.
 * - In the `script` of a template an arg is a value in code. `escape: 'script'` prints a string as a TypeScript string
 *   literal and a number or a boolean as it is, whatever the value is.
 */
export interface SnippetArgAttr {
  /** The arg name. */
  readonly arg: string;
  /** `select`, `switch`: the printed text per value; `''` prints nothing. */
  readonly values?: Readonly<Record<string, string>>;
  /** `text`, `number`: the text before the escaped value, for example `placeholder="`. */
  readonly before?: string;
  /** `text`, `number`: the text after the escaped value, for example `"`. */
  readonly after?: string;
  /** `text`, `number`: the value that prints nothing. */
  readonly default?: StoryValue | null;
  /** `text`, `number`: what the value is. A `number` accepts finite numbers only; anything else prints nothing. Text when absent. */
  readonly kind?: 'text' | 'number';
  /** `text`, `number`: the context of the printed value, see `escapeSnippetValue`. `attribute` when absent. */
  readonly escape?: 'attribute' | 'angular' | 'script' | 'text';
}

/** An attribute that holds markup, such as a React slot prop: `label={<Label>Email</Label>}`. */
export interface SnippetMarkupAttr {
  /** The attribute name as printed, for example `label`. */
  readonly name: string;
  /** The markup inside the braces. It may hold arg attributes. */
  readonly markup: readonly SnippetNode[];
}

/** An attribute that prints as text: literal text (`cckButton`, `size="lg"`) or a part that follows an arg. */
export type SnippetTextAttr = string | SnippetArgAttr;

/** An attribute of a snippet element: literal text, a part that follows an arg, or markup in braces. */
export type SnippetAttr = SnippetTextAttr | SnippetMarkupAttr;

/**
 * The lines around the content of a conditional block, as the framework writes them: Angular `@if (open()) {`,
 * `} @else {` and `}`; React `{open ? (`, `) : (` and `)}` (`) : null}` when there is no `otherwise`).
 */
export interface SnippetBlock {
  /** The line before the content. */
  readonly open: string;
  /** The line between the content and the `otherwise` content; printed only when there is `otherwise` content. */
  readonly middle: string;
  /** The line after the last content. */
  readonly close: string;
  /**
   * The text before and after the content when the block prints on one line, which it does when the content is one
   * line and the line fits the columns (a React scoped-slot arrow). Without it the block prints on its own lines.
   */
  readonly flat?: { readonly open: string; readonly close: string };
}

/**
 * An element of a snippet template, framework-neutral: the printers decide tag names, attributes and `selfClosing`.
 * An element with `conditionalLines` is no tag: its `children` (and `otherwise`) sit between those lines.
 */
export interface SnippetElement {
  /** The tag name as printed. */
  readonly tag: string;
  /** The attributes in print order. */
  readonly attrs: readonly SnippetAttr[];
  /** The content: text and elements. */
  readonly children: readonly SnippetNode[];
  /** Print `<x … />` instead of an opening and a closing tag; only for an element without children. */
  readonly selfClosing?: boolean;
  /** Print the lines of a conditional block instead of a tag. `tag` and `attrs` are ignored. */
  readonly conditionalLines?: SnippetBlock;
  /** The content after `conditionalLines.middle`; only with `conditionalLines`. */
  readonly otherwise?: readonly SnippetNode[];
}

/**
 * A node of a snippet: text (printed as it is, already escaped), a text hole or an element. A text hole is an arg
 * attribute used as the text of an element (`<p>{maxLength}</p>`): `renderSnippet` fills it with the escaped value and
 * lays it out like the text around it. A consumer that narrows a node to an element must handle the hole.
 */
export type SnippetNode = string | SnippetArgAttr | SnippetElement;

/**
 * The code of a story with its args left open (the playground, or a custom story with args). The code is `before`, the
 * laid-out `markup` and `after`. The page fills it with `renderSnippet`; the compiler builds it from the same story as
 * the inline output.
 */
export interface SnippetTemplate {
  /** The code before the markup. The markup starts on the line that follows its last line break. */
  readonly before: string;
  /** The markup, with args left open. */
  readonly markup: readonly SnippetNode[];
  /** The number of spaces the markup is indented by. */
  readonly indent: number;
  /** The code after the markup. */
  readonly after: string;
  /**
   * The code around the markup when an arg is read in it (a `derived` value of a custom story): text and arg holes.
   * When it is set, `renderSnippet` fills it and ignores `before` and `after`, which keep the code for the default
   * args. The markup starts on the line that follows the last line break of `script.before`.
   */
  readonly script?: {
    readonly before: readonly SnippetTextAttr[];
    readonly after: readonly SnippetTextAttr[];
  };
}

/** A filled snippet. */
export interface RenderedSnippet {
  /** The code. */
  readonly code: string;
  /** The 0-based lines of `code`, each once, that print an arg; an arg with a `default` prints, and so marks its line, only when its value differs from it. */
  readonly changedLines: readonly number[];
}
