/**
 * The first value that is not `undefined`: the own value, then the nearest parent that sets one. `null` is a value
 * (it removes the option), so it stops the search. @internal
 */
export function inherited<T>(own: T | undefined, ...parents: (T | undefined)[]): T | undefined {
  return [own, ...parents].find((value) => value !== undefined);
}
