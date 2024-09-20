/** @module ensure */

export function isBoolean(value: any): value is boolean {
  return typeof value === 'boolean';
}

export function isNotBoolean<T>(value: T): value is Exclude<T, boolean> {
  return !isBoolean(value);
}
