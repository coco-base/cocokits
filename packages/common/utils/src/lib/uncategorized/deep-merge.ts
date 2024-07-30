import _ from 'lodash';

export function deepMerge<T, U>(target: T, source: U, customizer = deepMergeDefaultCustomize): T & U {
  return _.mergeWith(target, source, customizer);
}

/**
 * Merges two arrays based on a custom condition using the lodash _.mergeWith() method.
 * The customizer function defines the condition for merging the elements of the arrays.
 * Without this customization, the array for a same property will be used.
 */
export function deepMergeDefaultCustomize(obj: unknown, src: unknown) {
  if (_.isArray(obj) && _.isArray(src)) {
    const set = new Set([...obj, ...src]);
    return Array.from(set);
  }

  // if (_.isArray(obj)) {
  //   return obj.concat(src);
  // }
  return;
}

/**
 * Merges two objects with special handling for arrays of objects.
 *
 * This function deeply merges two objects, `target` and `source`, using the lodash _.mergeWith() method.
 * It contains a customizer function that handles the merging of arrays containing objects. When merging
 * arrays, it checks for the presence of an `id` property in the objects within the arrays. If objects with
 * the same `id` are found in both arrays, their properties will be merged into a single object. If not, the
 * new object from the source array will be added to the target array as a separate item.
 *
 * Example:
 *
 * target: {
 *   list1: [{id: 1, name: 'milad1'}, {id: 2, name: 'milad2'}],
 *   mode: 'mode1'
 * }
 *
 * source: {
 *   list1: [{id: 1, age: 31}, {id: 3, age: 33}],
 *   mode: 'mode2'
 * }
 *
 * Result:
 * {
 *   list1: [
 *     {id: 1, name: 'milad1', age: 31},
 *     {id: 2, name: 'milad2'},
 *     {id: 3, age: 33}
 *   ],
 *   mode: 'mode2'
 * }
 *
 * Explanation:
 * - The `list1` array in the target contains objects with `id` values 1 and 2.
 * - The `list1` array in the source contains objects with `id` values 1 and 3.
 * - The customizer function merges the object with `id: 1` from both arrays, combining their properties.
 * - The object with `id: 2` from the target array remains unchanged as there is no matching `id` in the source array.
 * - The object with `id: 3` from the source array is added as a new item to the merged array.
 * - The `mode` property is overwritten by the value from the source object, resulting in 'mode2'.
 */
export function deepMergeWithIdCustomizer(objValue: unknown, srcValue: unknown) {
  const isObjectWithId = (value: any): value is { id: any } => {
    return _.isObject(value) && 'id' in value;
  };

  if (_.isArray(objValue) && _.isArray(srcValue)) {
    const mergedArray = _.cloneDeep(objValue);

    srcValue.forEach((srcItem) => {
      const targetIndex = mergedArray.findIndex(
        (targetItem) => isObjectWithId(targetItem) && isObjectWithId(srcItem) && targetItem.id === srcItem.id
      );
      if (targetIndex >= 0) {
        mergedArray[targetIndex] = _.merge({}, mergedArray[targetIndex], srcItem);
      } else {
        mergedArray.push(srcItem);
      }
    });

    return mergedArray;
  }

  return;
}
