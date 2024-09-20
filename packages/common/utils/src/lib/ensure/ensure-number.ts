/** @module ensure */

export function isNumberOrNaN(value: any): value is number {
  return typeof value === 'number';
}

export function isNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function isNotNumber<T>(value: T): value is Exclude<T, number> {
  return !isNumber(value);
}
