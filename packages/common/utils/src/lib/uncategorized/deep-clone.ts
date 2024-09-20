/** @module common */

import _ from 'lodash';

export function deepClone<T>(target: T): T {
  return _.cloneDeep(target);
}
