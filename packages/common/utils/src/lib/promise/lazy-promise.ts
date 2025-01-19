/** @module Promise */

/**
 * Creates a lazy promise that can be resolved or rejected externally.
 *
 * @template T The type of the value that the promise resolves to.
 *
 * @returns An object containing the promise and its resolve and reject functions.
 *
 * @example
 * ```typescript
 * const { promise, resolve, reject } = lazyPromise<number>();
 *
 * promise.then(value => {
 *   console.log(value); // Output: 42
 * });
 *
 * // Resolve the promise with a value
 * resolve(42);
 * ```
 *
 *  * @example
 * ```typescript
 * const { promise, resolve, reject } = lazyPromise<number>();
 *
 * promise.catch(error => {
 *   console.error(error); // Output: Error: Something went wrong
 * });
 *
 * // Reject the promise with an error
 * reject(new Error('Something went wrong'));
 * ```
 */
export function lazyPromise<T>() {
  let resolveFunc!: (value: T | PromiseLike<T>) => void;
  let rejectFunc!: (reason?: any) => void;

  const promise = new Promise<T>((resolve, reject) => {
    resolveFunc = resolve;
    rejectFunc = reject;
  });

  return {
    promise,
    resolve: resolveFunc,
    reject: rejectFunc,
  };
}
