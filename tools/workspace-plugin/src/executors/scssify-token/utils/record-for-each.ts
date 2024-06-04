/**
 * Helper function to iterate over each key-value pair in a record.
 * It's only a helper function to avoid writing a lot of code for iterating over a record.
 *
 * @param source - The source record to iterate over.
 * @param callback - The function to call for each key-value pair. It receives the value and key as arguments.
 */
export function recordForEach<TSource>(
  source: TSource,
  callback: (value: TSource[keyof TSource], key: string) => void
): void {
  Object.entries(source).forEach(([currentKey, currentValue]) => {
    callback(currentValue, currentKey);
  });
}
