/** @module ensure */

/**
 * Determines whether the provided value is a Blob object.
 *
 * @param value The value to check.
 * @returns Returns `true` if the value is a Blob object, otherwise `false`.
 *
 * @example
 * ```typescript
 * const file = new File(["content"], "example.txt", { type: "text/plain" });
 * const blob = new Blob(["content"], { type: "text/plain" });
 *
 * console.log(isBlob(file)); // false
 * console.log(isBlob(blob)); // true
 * ```
 */
export function isBlob(value: any): value is Blob {
  return value instanceof Blob && typeof value === 'object';
}

/**
 * Determines whether the provided value is not a Blob object.
 *
 * @template T The type of the value being checked.
 * @param value The value to check.
 * @returns Returns `true` if the value is not a Blob, otherwise `false`.
 *
 * @example
 * ```typescript
 * const file = new File(["content"], "example.txt", { type: "text/plain" });
 * const blob = new Blob(["content"], { type: "text/plain" });
 *
 * console.log(isNotBlob(file)); // true
 * console.log(isNotBlob(blob)); // false
 * ```
 */
export function isNotBlob<T>(value: T): value is Exclude<T, Blob> {
  return !isBlob(value);
}
