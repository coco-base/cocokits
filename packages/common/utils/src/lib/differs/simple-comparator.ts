/** @module comparator */

/**
 * Compares two objects for shallow equality.
 *
 * @template T The type of the objects being compared.
 * @param previous The previous object.
 * @param current The current object.
 * @returns True if both objects are shallowly equal, false otherwise.
 *
 * @example
 * const obj1 = { a: 1, b: 2 };
 * const obj2 = { a: 1, b: 2 };
 * const obj3 = { a: 1, b: 3 };
 *
 * console.log(simpleComparator(obj1, obj2)); // true
 * console.log(simpleComparator(obj1, obj3)); // false
 */
export function simpleComparator<T extends Record<string | number | symbol, any>>(previous: T, current: T): boolean {
  if (previous === current) {
    return true;
  }
  const prevKeys = Object.keys(previous);
  const currKeys = Object.keys(current);
  if (prevKeys.length !== currKeys.length) {
    return false;
  }
  for (const key of prevKeys) {
    if (previous[key] !== current[key]) {
      return false;
    }
  }

  return true;
}

/**
 * Compares two objects for deep equality.
 *
 * @template T The type of the objects being compared.
 * @param previous The previous object.
 * @param current The current object.
 * @returns True if both objects are deeply equal, false otherwise.
 *
 * @example
 * const obj1 = { a: 1, b: { c: 2 } };
 * const obj2 = { a: 1, b: { c: 2 } };
 * const obj3 = { a: 1, b: { c: 3 } };
 *
 * console.log(deepComparator(obj1, obj2)); // true
 * console.log(deepComparator(obj1, obj3)); // false
 */
export function deepComparator<T extends Record<string | number | symbol, any>>(previous: T, current: T): boolean {
  if (previous === current) {
    return true;
  }

  const prevKeys = Object.keys(previous);
  const currKeys = Object.keys(current);

  if (prevKeys.length !== currKeys.length) {
    return false;
  }

  for (const key of prevKeys) {
    const prevValue = previous[key];
    const currValue = current[key];

    if (prevValue === currValue) {
      continue;
    }

    if (typeof prevValue !== typeof currValue) {
      return false;
    }

    if (typeof prevValue === 'object' && prevValue !== null && currValue !== null) {
      if (!deepComparator(prevValue, currValue)) {
        return false;
      }
    } else {
      return false;
    }
  }

  return true;
}
