/** The `values` and `default` of a theme option that a token collection backs. */
export interface ModeOption<M extends string> {
  readonly values: readonly M[];
  readonly default: M;
}

/** Keeps only `picked` of a generated mode list, in source order. `defaultMode` must be one of them. */
export function pickModes<const M extends readonly string[], const P extends M[number]>(
  modes: M,
  picked: readonly P[],
  defaultMode: NoInfer<P>,
): ModeOption<P> {
  return { values: modes.filter((mode): mode is P => picked.includes(mode as P)), default: defaultMode };
}

/** Drops `omitted` from a generated mode list, in source order. `defaultMode` must not be dropped. */
export function omitModes<const M extends readonly string[], const O extends M[number]>(
  modes: M,
  omitted: readonly O[],
  defaultMode: NoInfer<Exclude<M[number], O>>,
): ModeOption<Exclude<M[number], O>> {
  return {
    values: modes.filter((mode): mode is Exclude<M[number], O> => !omitted.includes(mode as O)),
    default: defaultMode,
  };
}
