/**
 * The id a trigger carries: the one the author wrote, else the one the machine derived.
 *
 * @internal
 * @param authored - The `id` attribute the author put on the part (from `useAttrs()`).
 * @param generated - The id the machine derived.
 * @returns `authored` when it is a string, else `generated`.
 */
export function idOf(authored: unknown, generated: string | undefined): string | undefined {
  return typeof authored === 'string' ? authored : generated;
}
