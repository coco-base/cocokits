/** @module string */

/**
 * Converts a string to Title Case.
 *
 * @param str - The string to convert.
 * @returns The Title Case version of the input string.
 *
 * @example
 * ```ts
 * console.log(toTitleCase("hello world"));
 * // Output: "Hello World"
 * ```
 */
export function toTitleCase(str: string): string {
  // Split by spaces, underscores, dashes, or before uppercase letters
  const words = str
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Handle camelCase
    .split(/[\s_-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1));
  return words.join(' ');
}

/**
 * Converts a string to camelCase format by lowercasing the first word
 * and capitalizing the first letter of subsequent words.
 *
 * Splits the original string on whitespace, underscores, or dashes, then
 * transforms each part accordingly before concatenating them into a single
 * camelCase string.
 *
 * @param str - The string to convert to camelCase.
 * @returns The camelCase version of the input string.
 *
 * @example
 * ```ts
 * console.log(toCamelCase("hello world"));
 * // Output: "helloWorld"
 *
 * console.log(toCamelCase("some-string_example"));
 * // Output: "someStringExample"
 * ```
 */
export function toCamelCase(str: string): string {
  const words = str
    .trim()
    .split(/\s+|[-_]+/)
    .map((w) => w.toLowerCase());
  return (
    words[0] +
    words
      .slice(1)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join('')
  );
}

/**
 * Converts a string to PascalCase format by capitalizing the first letter of each word.
 *
 * @param str - The string to convert to PascalCase.
 * @returns The PascalCase version of the input string.
 *
 * @example
 * ```ts
 * console.log(toPascalCase("hello world"));
 * // Output: "HelloWorld"
 * ```
 */
export function toPascalCase(str: string): string {
  return str
    .trim()
    .split(/\s+|[-_]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('');
}

/**
 * Converts a string to kebab-case format by lowercasing all letters and joining words with dashes.
 *
 * @param str - The string to convert to kebab-case.
 * @returns The kebab-case version of the input string.
 *
 * @example
 * ```ts
 * console.log(toKebabCase("Hello World"));
 * // Output: "hello-world"
 * ```
 */
export function toKebabCase(str: string): string {
  return str
    .trim()
    .split(/\s+|[-_]+/)
    .map((w) => w.toLowerCase())
    .join('-');
}

/**
 * Converts a string to snake_case format by lowercasing all letters and joining words with underscores.
 *
 * @param str - The string to convert to snake_case.
 * @returns The snake_case version of the input string.
 *
 * @example
 * ```ts
 * console.log(toSnakeCase("Hello World"));
 * // Output: "hello_world"
 * ```
 */
export function toSnakeCase(str: string): string {
  return str
    .trim()
    .split(/\s+|[--]+/)
    .map((w) => w.toLowerCase())
    .join('_');
}
