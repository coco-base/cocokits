/** @module ensure */

export function isArray<T>(value: any): value is Array<T> {
  return Array.isArray(value);
}

export function isNotArray<T, U>(value: T): value is Exclude<T, Array<U>> {
  return !isArray(value);
}
