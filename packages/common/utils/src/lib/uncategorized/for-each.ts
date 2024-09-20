/** @module common */

/**
 * Iterates over each key-value pair in a record and applies a callback function to each pair.
 *
 * This helper function simplifies the process of iterating over the keys and values of an object
 * or record, avoiding the need to manually loop over `Object.entries()` in multiple places.
 *
 * @template TSource The type of the record being iterated over.
 *
 * @param source The source record to iterate over. Each key-value pair will be passed to the callback.
 * @param callback The function to call for each key-value pair. The callback receives the value and key as arguments.
 *
 * @example
 * ```typescript
 * const record = { a: 1, b: 2, c: 3 };
 * recordForEach(record, (value, key) => {
 *   console.log(key, value);
 * });
 * // Outputs:
 * // a 1
 * // b 2
 * // c 3
 * ```
 */
export function recordForEach<TSource extends { [key: string | number | symbol]: any }>(
  source: TSource,
  callback: (value: TSource[keyof TSource], key: string) => void
): void {
  Object.entries(source).forEach(([currentKey, currentValue]) => {
    callback(currentValue, currentKey);
  });
}
