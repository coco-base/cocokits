import { hintAnatomy } from './hint.anatomy';
import type { HintParts } from './hint.types';

/**
 * Computes the root props of a Hint. Pure.
 *
 * @returns The root props.
 */
export function getHintProps(): HintParts {
  return { root: { class: hintAnatomy.classes.root } };
}
