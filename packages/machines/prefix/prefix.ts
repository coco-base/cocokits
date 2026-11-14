import { prefixAnatomy } from './prefix.anatomy';
import type { PrefixParts } from './prefix.types';

/**
 * Computes the root props of a Prefix. Pure.
 *
 * @returns The root props.
 */
export function getPrefixProps(): PrefixParts {
  return { root: { class: prefixAnatomy.classes.root } };
}
