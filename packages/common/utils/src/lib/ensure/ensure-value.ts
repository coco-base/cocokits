/** @module ensure */

import { isArray } from './ensure-array';
import { isBlob } from './ensure-blob';
import { isNullish } from './ensure-nullish';
import { isNumberOrNaN } from './ensure-number';
import { isObject } from './ensure-object';
import { isString } from './ensure-string';

export function hasValue(value: any): boolean {
  if (isNullish(value)) {
    return false;
  }
  if (isString(value)) {
    return value.trim() !== '';
  }
  if (isNumberOrNaN(value)) {
    return !isNaN(value);
  }
  if (isBlob(value)) {
    return true;
  }
  if (isArray(value)) {
    return value.length > 0;
  }
  if (isObject(value)) {
    return Object.keys(value).length > 0;
  }

  return true;
}

export function hasNotValue(value: any): boolean {
  return !hasValue(value);
}
