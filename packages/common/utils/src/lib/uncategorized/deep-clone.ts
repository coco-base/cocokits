/** @module common */

import _ from 'lodash';

/**
 * Creates a deep clone of the target object or value.
 *
 * Perform a deep copy of the input, ensuring that nested objects and arrays are fully cloned
 * without maintaining references to the original structures.
 *
 * @template T The type of the target object or value to be cloned.
 * @param target The object or value to be deeply cloned.
 * @returns A deep clone of the input object or value.
 *
 * @example
 * ```typescript
 * const obj = { a: 1, b: { c: 2 } };
 * const clone = deepClone(obj);
 * console.log(clone); // Outputs: { a: 1, b: { c: 2 } }
 *
 * // Modifying the clone does not affect the original object
 * clone.b.c = 42;
 * console.log(obj.b.c); // Outputs: 2
 * ```
 */
export function deepClone<T>(target: T): T {
  return _.cloneDeep(target);
}
