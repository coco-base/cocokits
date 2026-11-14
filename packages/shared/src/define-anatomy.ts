import { CCK_PREFIX } from './prefix';

/** One anatomy part: a human name and a description for docs and theme authors. */
export interface AnatomyPart {
  /** Human name of the part, for example `Root`. */
  readonly name: string;
  /** One sentence on what the part is. */
  readonly description: string;
}

type Kebab<S extends string> = S extends `${infer H}${infer T}`
  ? `${H extends Lowercase<H> ? H : `-${Lowercase<H>}`}${Kebab<T>}`
  : S;

/** The class of each part: the root carries the block class, others add `__<part>`. */
export type AnatomyClasses<B extends string, P> = {
  readonly [K in keyof P]: K extends 'root'
    ? `${typeof CCK_PREFIX}-${B}`
    : `${typeof CCK_PREFIX}-${B}__${Kebab<K & string>}`;
};

/** The object `defineAnatomy` returns: the declaration plus the `classes` map. */
export interface Anatomy<B extends string, P> {
  /** The block name, without prefix. */
  readonly block: B;
  /** The declared parts. */
  readonly parts: P;
  /** The class of each part. */
  readonly classes: AnatomyClasses<B, P>;
}

/**
 * Declares a component's parts and derives their classes.
 * The `const` type parameter keeps the literals, so callers never write `as const`.
 *
 * @param anatomy - The block name (kebab-case) and its parts. A `root` part is required.
 * @returns The same object plus `classes`: `root` is `cck-<block>`, `fooBar` is `cck-<block>__foo-bar`.
 */
export function defineAnatomy<
  const B extends string,
  const P extends { readonly root: AnatomyPart } & Readonly<Record<string, AnatomyPart>>,
>(anatomy: { readonly block: B; readonly parts: P }): Anatomy<B, P> {
  const classes: Record<string, string> = {};
  for (const partName of Object.keys(anatomy.parts)) {
    classes[partName] =
      partName === 'root'
        ? `${CCK_PREFIX}-${anatomy.block}`
        : `${CCK_PREFIX}-${anatomy.block}__${partName.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;
  }
  return { block: anatomy.block, parts: anatomy.parts, classes: classes as AnatomyClasses<B, P> };
}
