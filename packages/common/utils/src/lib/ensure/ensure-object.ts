/** @module ensure */

import { isNotArray } from './ensure-array';

export function isObject(value: any): value is object {
  return typeof value === 'object' && value !== null && isNotArray(value);
}

export function isNutObject<T>(value: T): value is Exclude<T, object> {
  return !isObject(value);
}
