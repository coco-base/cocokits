/** @module common */

import { deepMerge, deepMergeWithIdCustomizer } from './deep-merge';

/**
 * Reduces an object by merging the results of a callback function into a single object.
 * It's only a helper function to avoid writing a lot of code for reduce operations.
 *
 * @param source - The source object to call reduce.
 * @param callback - The callback function that processes each key-value pair.
 * @param initValue - The initial value for the reduction. Default is {}
 * @returns The result of merging all callback results.
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
 * It's only a helper function to avoid writing a lot of code for reduce operations.
 *
 * @param  source - The source object to reduce.
 * @param callback - The callback function that processes each key-value pair.
 * @param initValue - The initial value for the reduction. Default is {}
 * @returns The result of deeply merging all callback results.
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
 * Reduces an object by deeply merging the results of a callback function into a single object.
 * If the items list in object same id, then it will merge the items into single item, otherwise the 2 items will merge into list a 2 items
 * It's only a helper function to avoid writing a lot of code for reduce operations.
 *
 * @param  source - The source object to reduce.
 * @param callback - The callback function that processes each key-value pair.
 * @param initValue - The initial value for the reduction. Default is {}
 * @returns The result of deeply merging all callback results.
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
 * It's only a helper function to avoid writing a lot of code for reduce operations.
 *
 * @param source - The source array to reduce.
 * @param callback - The callback function that processes each item.
 * @param initValue - The initial value for the reduction. Default is {}
 * @returns The result of merging all callback results.
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
 * It's only a helper function to avoid writing a lot of code for reduce operations.
 *
 * @param source - The source array to reduce.
 * @param callback - The callback function that processes each item.
 * @param initValue - The initial value for the reduction. Default is {}
 * @returns The result of deeply merging all callback results.
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
