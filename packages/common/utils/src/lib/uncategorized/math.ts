/** @module math */

/**
 * Clamps a number within the specified bounds.
 *
 * @param value - The number to clamp.
 * @param bounds - An array containing the minimum and maximum bounds [minBound, maxBound].
 * @returns The clamped value.
 *
 * @example
 * const clampedValue = clamp(10, [0, 5]);
 * console.log(clampedValue); // Output: 5
 *
 * @example
 * const clampedValue = clamp(-3, [0, 5]);
 * console.log(clampedValue); // Output: 0
 *
 * @example
 * const clampedValue = clamp(3, [0, 5]);
 * console.log(clampedValue); // Output: 3
 */
export function clamp(value: number, [minBound, maxBound]: [number, number]): number {
  return Math.max(minBound, Math.min(value, maxBound));
}
