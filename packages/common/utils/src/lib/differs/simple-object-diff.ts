/** @module differs */

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
