/**
 * @description checks if token value has a specific unit
 * @param value token value
 * @param unit unit string like px or value
 * @returns boolean
 */
export function hasUnit(value: string | number, unit: string): boolean {
  if (typeof value === 'number') {
    return false;
  }

  return value.indexOf(unit) > -1;
}

/**
 * Checks if the design token value is an alias.
 * An alias is a string that starts with '{' and ends with '}'.
 * For example, '{spacing.space.0}' is an alias and '4px' is a real value.
 *
 * @param value The value to check if it is an alias.
 * @returns True if the value is an alias, otherwise false.
 */
export function isAliasValue(value: unknown): value is string {
  return typeof value === 'string' && value.startsWith('{') && value.endsWith('}');
}
