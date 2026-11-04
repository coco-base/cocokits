import { escapeSnippetValue } from './escape-snippet-value';
import type { StoryValue } from './story';

/** Layout white space: a text node of only these is dropped by Angular and Vue, and by the layout of a snippet. */
const LAYOUT_SPACE = /^[ \t\n\r\f]+$/;

/**
 * The text a text hole prints for a value: the text of an element, in the code shown and in the code the compiler
 * prints, so the two are one function of the value.
 *
 * - A `null` or missing value, a number hole whose value is not a finite number, an empty value and a value of only
 *   layout white space print nothing.
 * - Any other value is escaped for text (`text`: `&`, `<`, `>`, `{`, `}` as entities) or for an Angular template
 *   (`angular`). An Angular value also writes a `{` or a `}` at its start or end as `{{ '{' }}` or `{{ '}' }}`, because
 *   the entity of a brace next to the entity of another brace (the end of the node before, the start of the node after)
 *   is read as `{{` once Angular decodes it.
 *
 * @internal Exported for the story compiler; not part of the documented API.
 * @param value - The value of the arg.
 * @param escape - The context of the text.
 * @param kind - `number` for a hole whose arg is a number.
 */
export function printTextHole(
  value: StoryValue | null | undefined,
  escape: 'text' | 'angular',
  kind: 'text' | 'number' = 'text',
): string {
  if (value === null || value === undefined) return '';
  if (kind === 'number' && !(typeof value === 'number' && Number.isFinite(value))) return '';
  const raw = String(value);
  if (LAYOUT_SPACE.test(raw)) return '';
  const escaped = escapeSnippetValue(raw, escape);
  if (escape === 'text') return escaped;
  return escaped
    .replace(/^&#123;|^&#125;/, (brace) => (brace === '&#123;' ? "{{ '{' }}" : "{{ '}' }}"))
    .replace(/&#123;$|&#125;$/, (brace) => (brace === '&#123;' ? "{{ '{' }}" : "{{ '}' }}"));
}
