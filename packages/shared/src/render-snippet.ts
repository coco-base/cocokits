import { escapeSnippetValue } from './escape-snippet-value';
import { printTextHole } from './text-hole';
import { layoutNodes, type ResolvedAttr } from './layout-markup';
import type { RenderedSnippet, SnippetArgAttr, SnippetTemplate, SnippetTextAttr } from './snippet';
import type { StoryValue } from './story';

type SnippetArgs = Readonly<Record<string, StoryValue | null>>;

/** The printed text of a `select` or `switch` value; only an own string entry counts. */
function mapped(values: Readonly<Record<string, string>>, value: StoryValue): string {
  const key = String(value);
  const text = Object.hasOwn(values, key) ? values[key] : undefined;
  return typeof text === 'string' ? text : '';
}

/** The value of an arg in code: a string as a TypeScript string literal, a number or a boolean as it is. */
function printScriptArg(attr: SnippetArgAttr, value: StoryValue): string {
  const text = typeof value === 'string' ? escapeSnippetValue(value, 'script') : String(value);
  return `${attr.before ?? ''}${text}${attr.after ?? ''}`;
}

function printArg(attr: SnippetArgAttr, value: StoryValue | null | undefined): string {
  if (value === null || value === undefined) return '';
  if (attr.escape === 'script') return printScriptArg(attr, value);
  if (attr.values) return mapped(attr.values, value);
  if (attr.kind === 'number' && !(typeof value === 'number' && Number.isFinite(value))) return '';
  if (attr.default !== undefined && attr.default !== null && String(attr.default) === String(value)) return '';
  return `${attr.before ?? ''}${escapeSnippetValue(String(value), attr.escape)}${attr.after ?? ''}`;
}

function resolveAttr(attr: SnippetTextAttr, args: SnippetArgs, hole = false): ResolvedAttr {
  if (typeof attr === 'string') return { text: attr, changed: false };
  const value = Object.hasOwn(args, attr.arg) ? args[attr.arg] : undefined;
  const text = hole
    ? printTextHole(value, attr.escape === 'angular' ? 'angular' : 'text', attr.kind)
    : printArg(attr, value);
  return { text, changed: text !== '' };
}

function countLineBreaks(text: string): number {
  return text.split('\n').length - 1;
}

/** One side of the script: its code, and the 0-based lines (counted from `first`) of the holes that printed text. */
function fillScript(
  parts: readonly SnippetTextAttr[],
  args: SnippetArgs,
  first: number,
): { readonly text: string; readonly changed: number[] } {
  let text = '';
  const changed: number[] = [];
  for (const part of parts) {
    const resolved = resolveAttr(part, args);
    if (resolved.changed) changed.push(first + countLineBreaks(text));
    text += resolved.text;
  }
  return { text, changed };
}

/**
 * Fills a snippet template with the current args. Pure and synchronous, so the page can call it on every control
 * change.
 *
 * An arg attribute prints nothing when its arg is `null` or missing, when a `select` or `switch` value maps to `''`
 * or is not an own entry of `values`, when a `number` value is not a finite number, and when a `text` or `number`
 * value equals `default`. An arg inside a markup attribute follows the same rules. The markup follows the layout rule of `layoutMarkup`. An attribute that printed text is a
 * non-default value (any value, for a hole without `default`), and its line is in `changedLines`, once.
 *
 * An arg hole that is a node of the markup (a text hole) is the text of an element: it prints its escaped value
 * (`printTextHole`; `before`, `after` and `default` are not used), laid out with the text around it, and marks its line
 * on every render that printed text. A null, missing or empty value, or a value of only spaces, tabs or line breaks, prints and marks nothing.
 *
 * A template with a `script` fills it instead of `before` and `after`. An arg hole there with `escape: 'script'` prints
 * its value whatever it is: a string as a TypeScript literal, a number or a boolean as it is. The line of a hole that
 * printed text is in `changedLines`.
 *
 * @param template - The template of a story with args.
 * @param args - The arg values by arg name.
 * @returns The code, and the 0-based lines of the code that print an arg (a non-default one when the arg has a `default`), each once.
 */
export function renderSnippet(template: SnippetTemplate, args: SnippetArgs): RenderedSnippet {
  const lines = layoutNodes(template.markup, template.indent, (attr, hole) => resolveAttr(attr, args, hole));
  const before = template.script ? fillScript(template.script.before, args, 0) : undefined;
  const beforeText = before?.text ?? template.before;
  const first = countLineBreaks(beforeText);
  const after = template.script
    ? fillScript(template.script.after, args, first + Math.max(lines.length - 1, 0))
    : undefined;
  const marked = lines.flatMap((line, index) => (line.changed ? [first + index] : []));
  return {
    code: `${beforeText}${lines.map((line) => line.text).join('\n')}${after?.text ?? template.after}`,
    changedLines: [...new Set([...(before?.changed ?? []), ...marked, ...(after?.changed ?? [])])],
  };
}
