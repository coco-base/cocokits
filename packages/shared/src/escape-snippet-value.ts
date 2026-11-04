const ATTRIBUTE_ENTITIES: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '"': '&quot;',
  '<': '&lt;',
  '{': '&#123;',
  '}': '&#125;',
};

const LINE_SEPARATOR = String.fromCharCode(0x2028);
const PARAGRAPH_SEPARATOR = String.fromCharCode(0x2029);
/** The character that brackets an arg in the inline code of the story compiler: a literal never holds it raw. */
const PRIVATE_MARK = String.fromCharCode(0xe000);
const BACKSLASH = String.fromCharCode(92);

/**
 * A single-quoted TypeScript string literal. It escapes every line terminator, and `<` before `/` or `!`, which would
 * end a Vue `<script setup>` block, and U+E000, which the story compiler uses to mark an arg in its code.
 */
function scriptLiteral(value: string): string {
  const escaped = value
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .split(LINE_SEPARATOR)
    .join('\\u2028')
    .split(PARAGRAPH_SEPARATOR)
    .join('\\u2029')
    .split(PRIVATE_MARK)
    .join(`${BACKSLASH}ue000`)
    .replace(/<(?=[/!])/g, '\\u003C');
  return `'${escaped}'`;
}

const TEXT_ENTITIES: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '{': '&#123;',
  '}': '&#125;',
};

const ANGULAR_ENTITIES: Readonly<Record<string, string>> = { ...ATTRIBUTE_ENTITIES, '@': '&#64;' };

function entities(value: string, table: Readonly<Record<string, string>>): string {
  return value.replace(/[&"<{}@]/g, (char) => table[char] ?? char);
}

/**
 * Escapes a value for printed markup.
 *
 * - `attribute` (the default) makes the value safe in a double-quoted attribute of a Vue template or of JSX: `&`,
 *   `"`, `<`, `{` and `}` become entities. It is not enough for an Angular template: Angular reads `{{` as an
 *   interpolation even when the braces are entities, and `@` starts a block.
 * - `text` makes the value safe as the text of a React or Vue element: `&`, `<`, `>`, `{` and `}` become entities.
 *   It is the escape of a text hole, an arg printed as the text of an element.
 * - `angular` makes the value safe in an Angular template, which the compiler prints inside a TypeScript template
 *   literal. Each `{{` becomes an interpolation of the string `'{{'`; `@` becomes an entity; backslashes, backticks
 *   and `${` are escaped for the template literal.
 * - `script` makes the value a single-quoted TypeScript string literal, quotes included, for code around the markup
 *   (a `derived` value that reads an arg). The compiler prints every string of the code with it.
 *
 * `renderSnippet` escapes arg values with it, and the story compiler escapes literal values with it, so the two
 * outputs are the same function of the same value.
 *
 * @internal Exported for the story compiler; not part of the documented API.
 * @param value - The raw value.
 * @param mode - The context of the printed value.
 */
export function escapeSnippetValue(
  value: string,
  mode: 'attribute' | 'angular' | 'script' | 'text' = 'attribute',
): string {
  if (mode === 'script') return scriptLiteral(value);
  if (mode === 'attribute') return entities(value, ATTRIBUTE_ENTITIES);
  if (mode === 'text') return value.replace(/[&<>{}]/g, (char) => TEXT_ENTITIES[char] ?? char);
  const escaped = value
    .split('{{')
    .map((part) => entities(part, ANGULAR_ENTITIES))
    .join("{{ '{{' }}");
  return escaped.replace(/[\\`]/g, '\\$&').replace(/\$\{/g, '\\${');
}
