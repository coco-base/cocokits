/**
 * Wraps the result of a function with backticks.
 *
 * @param {(...params: P) => string} fn - The function to wrap.
 * @return {(...params: P) => string} - A new function that wraps the result with backticks.
 *
 * @throws {TypeError} If the provided argument is not a function or the function does not return a string.
 */
export function wrapWithBacktick(fn) {
  if (typeof fn !== 'function') {
    throw new TypeError('The argument provided to wrapWithBacktick must be a function.');
  }

  /**
   * The wrapped function that adds backticks to the original function's output.
   *
   * @param  {...any} params - The parameters to pass to the original function.
   * @return {string} - The original function's output wrapped with backticks.
   */
  return function (...params) {
    const originalValue = fn(...params);

    if (typeof originalValue !== 'string') {
      throw new TypeError('The original function must return a string.');
    }

    const markdownTextOnly = removeEscapesMarkdownText(originalValue);
    return `\`${markdownTextOnly}\``;
  };
}

/**
 * Removes Markdown formatting artifacts such as links, backslashes, and backticks.
 *
 * @param {string} str - The string to clean up.
 * @return {string} - The cleaned-up string without Markdown artifacts.
 */
export function removeEscapesMarkdownText(str) {
  return str
    .replace(/\[((?:\[[^\]]*\]|[^\[\]])*)\]\([^\)]*\)/g, '$1') // Removes Markdown links, keeping link text.
    .replace(/\\(.)/g, '$1') // Removes backslashes from escaped characters.
    .replace(/`/g, ''); // Removes backticks.
}

/**
 * Capitalizes the first letter of each word in a string.
 * @param {string} input - The input string.
 * @returns {string} The string with each word capitalized.
 *
 * @example
 * const result = capitalizeWords('hello world');
 * console.log(result); // 'Hello World'
 */
export function capitalizeWords(input) {
  return input
    .split(/\s+/)
    .map(word => {
      if (word.length === 0) {
        return '';
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

export function generateAnchorId(input) {
  if (typeof input !== 'string') {
    throw new TypeError('Input must be a string');
  }

  return input
    .trim() // Remove leading and trailing whitespace
    .toLowerCase() // Convert to lowercase
    .normalize('NFKD') // Normalize the string
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s-_:.]/g, '') // Remove invalid characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with a single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
}

