/** The Angular types that wrap the type a reader sees: inputs and models, and outputs. */
const WRAPPERS = new Set([
  'InputSignalWithTransform',
  'InputSignal',
  'ModelSignal',
  'OutputEmitterRef',
  'OutputRef',
  'EventEmitter',
]);

/**
 * Splits generic arguments at the commas that are not inside brackets, parentheses, braces or quotes. The workspace
 * project imports nothing internal, so it keeps its own scan (architecture §10, one exception).
 */
function topLevelArguments(text: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let quote = '';
  let escaped = false;
  let start = 0;
  for (let index = 0; index < text.length; index += 1) {
    const char = text.charAt(index);
    if (quote !== '') {
      // A backslash escapes the next character, also another backslash: `'a\\'` ends at its second quote.
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === quote) quote = '';
    } else if (char === '"' || char === "'" || char === '`') quote = char;
    else if ('<([{'.includes(char)) depth += 1;
    else if ('>)]}'.includes(char) && !(char === '>' && text.charAt(index - 1) === '=')) depth -= 1;
    else if (char === ',' && depth === 0) {
      parts.push(text.slice(start, index).trim());
      start = index + 1;
    }
  }
  parts.push(text.slice(start).trim());
  return parts;
}

/**
 * The read type of a member: the type a reader sees, not the type a writer may pass. `InputSignalWithTransform<boolean,
 * unknown>` (an input with `booleanAttribute`) reads `boolean`, `InputSignal<T>` and `ModelSignal<T>` read `T`, and
 * `OutputEmitterRef<T>` reads `T`, the payload. Any other type is returned as written.
 */
export function readType(typeText: string): string {
  const match = /^(\w+)<(.*)>$/s.exec(typeText.trim());
  const wrapper = match?.[1];
  if (match === null || wrapper === undefined || !WRAPPERS.has(wrapper)) return typeText.trim();
  return topLevelArguments(match[2] ?? '')[0] ?? typeText.trim();
}
