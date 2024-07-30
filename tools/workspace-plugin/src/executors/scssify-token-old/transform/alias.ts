/**
 * Extracts alias values from a string.
 *
 * @param value - The alias string to extract values from.
 * @returns The extracted alias values.
 *
 * @example
 * value: '{colors.gray.50}';
 * result: [ 'colors', 'gray', '50' ]
 */
export function aliasValue(value: string): string[] {
  const tokenAliasName = value
    .substring(1, value.length - 1)
    .toLowerCase()
    .trim();
  return tokenAliasName.split('.');
}
