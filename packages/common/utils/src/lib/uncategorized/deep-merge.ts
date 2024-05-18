import _ from 'lodash';

export function deepMerge<T, U>(target: T, source: U): T & U {
  return _.merge(target, source);
}
