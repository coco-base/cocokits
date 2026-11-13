import type { PartIconNames } from './svg-icon';

/**
 * Reads the icon name a theme gives a part that holds an icon (`partIconNames[block][part]`). Pure: no input is
 * mutated. Only own keys are read, so a block or part named like an `Object.prototype` member (`constructor`,
 * `__proto__`) gives no icon.
 *
 * @param partIconNames - The theme's `partIconNames` (an empty record when the theme names none).
 * @param block - The block of the component, read from its anatomy, never written as a literal.
 * @param part - The name of the part.
 * @returns The icon name, or `undefined` when the theme names no icon for the part.
 */
export function resolvePartIconName(partIconNames: PartIconNames, block: string, part: string): string | undefined {
  const parts = Object.hasOwn(partIconNames, block) ? partIconNames[block] : undefined;
  return parts !== undefined && Object.hasOwn(parts, part) ? parts[part] : undefined;
}
