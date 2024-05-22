import { isArray } from './ensure';

export function toArray<T>(value: T | T[]): T[] {
  return isArray(value) ? value : [value];
}
