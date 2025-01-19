/** @module common */

import { deepMerge, deepMergeWithIdCustomizer } from './deep-merge';

/**
 * Reduces an object by merging the results of a callback function into a single object.
 * This helper function simplifies writing reduce operations on objects.
 *
 * @template TSource The type of the source object.
 * @template TResult The type of the result object.
 *
 * @param source The source object to reduce.
 * @param callback The callback function that processes each key-value pair and returns a partial result to be merged.
 * @param initValue The initial value for the reduction. Defaults to an empty object `{}`.
 *
 * @returns The result of merging all callback results.
 *
 * @example
 * ```typescript
 * const source = { a: 1, b: 2, c: 3 };
 * const result = recordReduceMerge(source, (value, key) => ({ [key]: value * 2 }));
 * console.log(result); // { a: 2, b: 4, c: 6 }
 * ```
 */
export function recordReduceMerge<TSource extends { [key: string | number | symbol]: any }, TResult>(
  source: TSource,
  callback: (value: TSource[keyof TSource], key: string) => Partial<TResult> | null,
  initValue: Partial<TResult> = {}
): TResult {
  const result = Object.entries(source).reduce((previousValueMap, [currentKey, currentValue]) => {
    const newValueMap = callback(currentValue, currentKey);
    return newValueMap ? { ...previousValueMap, ...newValueMap } : previousValueMap;
  }, initValue as TResult);

  return result;
}

/**
 * Reduces an object by deeply merging the results of a callback function into a single object.
 * This function allows deep merging while processing the object.
 *
 * @template TSource The type of the source object.
 * @template TResult The type of the result object.
 *
 * @param source The source object to reduce.
 * @param callback The callback function that processes each key-value pair and returns a partial result to be deeply merged.
 * @param initValue The initial value for the reduction. Defaults to an empty object `{}`.
 *
 * @returns The result of deeply merging all callback results.
 *
 * @example
 * ```typescript
 * const source = { a: { x: 1 }, b: { y: 2 } };
 * const result = recordReduceDeepMerge(source, (value, key) => ({ [key]: value }));
 * console.log(result); // { a: { x: 1 }, b: { y: 2 } }
 * ```
 */
export function recordReduceDeepMerge<TSource extends { [key: string | number | symbol]: any }, TResult>(
  source: TSource,
  callback: (value: TSource[keyof TSource], key: string) => Partial<TResult> | null,
  initValue: Partial<TResult> = {}
): TResult {
  const result = Object.entries(source).reduce((previousValueMap, [currentKey, currentValue]) => {
    const newValueMap = callback(currentValue, currentKey);
    return newValueMap ? deepMerge(previousValueMap, newValueMap) : previousValueMap;
  }, initValue as TResult);

  return result;
}

/**
 * Reduces an object by deeply merging results with unique IDs into a single object.
 * This function handles arrays of objects by merging items with matching `id` values.
 *
 * @template TSource The type of the source object.
 * @template TResult The type of the result object.
 *
 * @param source The source object to reduce.
 * @param callback The callback function that processes each key-value pair and returns a partial result to be deeply merged.
 * @param initValue The initial value for the reduction. Defaults to an empty object `{}`.
 *
 * @returns The result of deeply merging all callback results with unique `id` handling.
 *
 * @example
 * ```typescript
 * const source = { list: [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }] };
 * const result = recordReduceDeepMergeUniqId(source, (value, key) => ({ [key]: value }));
 * console.log(result); // Merges arrays of objects by unique `id`
 * ```
 */
export function recordReduceDeepMergeUniqId<TSource extends { [key: string | number | symbol]: any }, TResult>(
  source: TSource,
  callback: (value: TSource[keyof TSource], key: string) => Partial<TResult> | null,
  initValue: Partial<TResult> = {}
): TResult {
  const result = Object.entries(source).reduce((previousValueMap, [currentKey, currentValue]) => {
    const newValueMap = callback(currentValue, currentKey);
    return newValueMap ? deepMerge(previousValueMap, newValueMap, deepMergeWithIdCustomizer) : previousValueMap;
  }, initValue as TResult);

  return result;
}

/**
 * Reduces an array by merging the results of a callback function into a single object.
 * This function simplifies reduce operations on arrays.
 *
 * @template TSource The type of the source array.
 * @template TResult The type of the result object.
 *
 * @param source The source array to reduce.
 * @param callback The callback function that processes each item and returns a partial result to be merged.
 * @param initValue The initial value for the reduction. Defaults to an empty object `{}`.
 *
 * @returns The result of merging all callback results.
 *
 * @example
 * ```typescript
 * const source = [1, 2, 3];
 * const result = reduceMerge(source, (value) => ({ [value]: value * 2 }));
 * console.log(result); // { 1: 2, 2: 4, 3: 6 }
 * ```
 */
export function reduceMerge<TSource, TResult>(
  source: TSource[],
  callback: (value: TSource) => Partial<TResult> | null,
  initValue: Partial<TResult> = {}
): TResult {
  const result = source.reduce((previousValueMap, currentValue) => {
    const newValueMap = callback(currentValue);

    return newValueMap ? { ...previousValueMap, ...newValueMap } : previousValueMap;
  }, initValue as TResult);

  return result;
}

/**
 * Reduces an array by deeply merging the results of a callback function into a single object.
 * This function allows deep merging while processing the array.
 *
 * @template TSource The type of the source array.
 * @template TResult The type of the result object.
 *
 * @param source The source array to reduce.
 * @param callback The callback function that processes each item and returns a partial result to be deeply merged.
 * @param initValue The initial value for the reduction. Defaults to an empty object `{}`.
 *
 * @returns The result of deeply merging all callback results.
 *
 * @example
 * ```typescript
 * const source = [{ x: 1 }, { y: 2 }];
 * const result = reduceDeepMerge(source, (value) => value);
 * console.log(result); // { x: 1, y: 2 }
 * ```
 */
export function reduceDeepMerge<TSource, TResult>(
  source: TSource[],
  callback: (value: TSource) => Partial<TResult> | null,
  initValue: Partial<TResult> = {}
): TResult {
  const result = source.reduce((previousValueMap, currentValue) => {
    const newValueMap = callback(currentValue);
    return newValueMap ? deepMerge(previousValueMap, newValueMap) : previousValueMap;
  }, initValue as TResult);

  return result;
}

/**
 * Repeats a callback function for a specified number of iterations and merges the results.
 *
 * @template TResult The type of the resulting object.
 * @param repeatCount The number of times to repeat the callback.
 * @param callback A function called on each iteration, returning a partial result to merge.
 * @param initValue Optional initial value for the merge. Defaults to `{}`.
 * @returns The merged result of calling the callback on each iteration.
 *
 * @example
 * ```typescript
 * const result = repeatReduceMerge(3, (index) => ({ [index]: index * 2 }));
 * console.log(result); // { 0: 0, 1: 2, 2: 4 }
 * ```
 */
export function repeatReduceMerge<TResult>(
  repeatCount: number,
  callback: (index: number) => Partial<TResult> | null,
  initValue: Partial<TResult> = {}
): TResult {
  let result = { ...initValue } as TResult;

  for (let i = 0; i < repeatCount; i++) {
    const newValue = callback(i);
    if (newValue) {
      result = { ...result, ...newValue };
    }
  }

  return result;
}
