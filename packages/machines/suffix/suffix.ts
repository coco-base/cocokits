import { suffixAnatomy } from './suffix.anatomy';
import type { SuffixParts } from './suffix.types';

/**
 * Computes the root props of a Suffix. Pure.
 *
 * @returns The root props.
 */
export function getSuffixProps(): SuffixParts {
  return { root: { class: suffixAnatomy.classes.root } };
}
