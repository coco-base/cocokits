import { trailingAnatomy } from './trailing.anatomy';
import type { TrailingParts } from './trailing.types';

/**
 * Computes the root props of a Trailing. Pure.
 *
 * @returns The root props.
 */
export function getTrailingProps(): TrailingParts {
  return { root: { class: trailingAnatomy.classes.root } };
}
