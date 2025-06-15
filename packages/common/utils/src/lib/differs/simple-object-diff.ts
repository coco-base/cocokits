/** @module differs */

/**
 * Computes the difference between two objects, returning a new object that represents the changes.
 *
 * @template T - The type of the objects being compared.
 * @param obj1 - The first object to compare.
 * @param obj2 - The second object to compare.
 * @returns A partial object containing the differences between `obj1` and `obj2`.
 *
 * @example
 * const obj1 = { a: 1, b: { c: 2 }, d: 4 };
 * const obj2 = { a: 1, b: { c: 3 }, e: 5 };
 * const diff = getObjectDiff(obj1, obj2);
 * console.log(diff); // Output: { b: { c: 3 }, d: null, e: 5 }
 */
export function getObjectDiff<T extends Record<string | number, any>>(obj1: T, obj2: T): Partial<T> {
  const diff: Record<string | number, any> = {};

  for (const key in obj1) {
    if (key in obj2) {
      const areBothObjects = typeof obj1[key] === 'object' && typeof obj2[key] === 'object';
      const isDifferent = obj1[key] !== obj2[key];

      if (areBothObjects) {
        const nestedDiff = getObjectDiff(obj1[key], obj2[key]);
        if (Object.keys(nestedDiff).length > 0) {
          diff[key] = nestedDiff;
        }
      } else if (isDifferent) {
        diff[key] = obj2[key];
      }
    } else {
      diff[key] = null;
    }
  }

  for (const key in obj2) {
    if (!(key in obj1)) {
      diff[key] = obj2[key];
    }
  }

  return diff as Partial<T>;
}
