/** @module ensure */

export function isStringAndNotBlank(value: any): value is Exclude<string, null | undefined> {
  return typeof value === 'string' && value.trim() !== '';
}

export function isString(value: any): value is string {
  return typeof value === 'string';
}

export function isNotString<T>(value: T): value is Exclude<T, string> {
  return !isString(value);
}
