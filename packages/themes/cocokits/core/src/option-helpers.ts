import type { OptionalOption, RootOption } from './option-types';

/** The `size` option on the root, from the modes of its token collection. */
export const rootSize = <V extends readonly string[]>(
  values: V,
  defaultMode: V[number],
  description: string,
): RootOption<V> => ({
  attrName: 'size',
  values,
  default: defaultMode,
  partNames: ['root'],
  description,
});

/** An option on the root that renders nothing until it is given: a group's option, which its children inherit. */
export const inheritable = <V extends readonly string[]>(
  attrName: string,
  values: V,
  description: string,
): OptionalOption<V> => ({ attrName, values, default: null, partNames: ['root'], description });
