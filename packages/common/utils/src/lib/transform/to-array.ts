/** @module transform */

import { isArray } from '../ensure/ensure-array';

export function toArray<T>(value: T | T[]): T[] {
  return isArray(value) ? value : [value];
}
