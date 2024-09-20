/** @module ensure */

export function isBlob(value: any): value is Blob {
  return value instanceof Blob && typeof value === 'object';
}

export function isNotBlob<T>(value: T): value is Exclude<T, Blob> {
  return !isBlob(value);
}
