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

// ------ Nullish ------

export function isNullish(value: any): value is null | undefined {
  return value === null || value === undefined;
}

export function isNotNullish<T>(value: T): value is Exclude<T, null | undefined> {
  return !isNullish(value);
}

// ------ String ------

export function isStringAndNotBlank(value: any): value is Exclude<string, null | undefined> {
  return typeof value === 'string' && value.trim() !== '';
}

export function isString(value: any): value is string {
  return typeof value === 'string';
}

export function isNotString<T>(value: T): value is Exclude<T, string> {
  return !isString(value);
}

// ------ Number ------

export function isNumberOrNaN(value: any): value is number {
  return typeof value === 'number';
}

export function isNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function isNotNumber<T>(value: T): value is Exclude<T, number> {
  return !isNumber(value);
}

// ------ Boolean ------

export function isBoolean(value: any): value is boolean {
  return typeof value === 'boolean';
}

export function isNotBoolean<T>(value: T): value is Exclude<T, boolean> {
  return !isBoolean(value);
}

// ------ Array ------

export function isArray<T>(value: any): value is Array<T> {
  return Array.isArray(value);
}

export function isNotArray<T, U>(value: T): value is Exclude<T, Array<U>> {
  return !isArray(value);
}

// ------ Blob ------

export function isBlob(value: any): value is Blob {
  return value instanceof Blob && typeof value === 'object';
}

export function isNotBlob<T>(value: T): value is Exclude<T, Blob> {
  return !isBlob(value);
}

// ------ Object ------

export function isObject(value: any): value is object {
  return typeof value === 'object' && value !== null && isNotArray(value);
}

export function isNutObject<T>(value: T): value is Exclude<T, object> {
  return !isObject(value);
}
