import _ from 'lodash';

export function deepMerge<T, U>(target: T, source: U): T & U {
  /**
   * Merges two arrays based on a custom condition using the lodash _.mergeWith() method.
   * The customizer function defines the condition for merging the elements of the arrays.
   * Without this customization, the array for a same property will be used.
   */
  const customizer = (obj: unknown, src: unknown) => {
    if (_.isArray(obj)) {
      return obj.concat(src);
    }
    return;
  };

  return _.mergeWith(target, source, customizer);
}
