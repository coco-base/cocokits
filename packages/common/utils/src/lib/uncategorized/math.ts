/** @module math */
export function clamp(value: number, [minBound, maxBound]: [number, number]): number {
  return Math.max(minBound, Math.min(value, maxBound));
}
