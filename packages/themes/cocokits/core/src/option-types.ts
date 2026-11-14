/** One theme option: the `data-*` it renders, its values, default and the parts that carry it. */
export interface Option<V extends readonly (string | boolean)[], P extends readonly string[]> {
  readonly attrName: string;
  readonly values: V;
  readonly default: V[number];
  readonly partNames: P;
  readonly description: string;
}

/** An option on the root part only. */
export type RootOption<V extends readonly (string | boolean)[]> = Option<V, readonly ['root']>;

/** An option that renders nothing until the author gives it (`default: null`). */
export type OptionalOption<V extends readonly (string | boolean)[]> = Omit<RootOption<V>, 'default'> & {
  readonly default: null;
};
