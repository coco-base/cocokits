import { tagAnatomy } from './tag.anatomy';
import type { TagParts } from './tag.types';

/**
 * Computes the root props of a Tag. Pure.
 *
 * @returns The root props.
 */
export function getTagProps(): TagParts {
  return { root: { class: tagAnatomy.classes.root } };
}
