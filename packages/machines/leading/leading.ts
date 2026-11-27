import { leadingAnatomy } from './leading.anatomy';
import type { LeadingParts } from './leading.types';

/**
 * Computes the root props of a Leading. Pure.
 *
 * @returns The root props.
 */
export function getLeadingProps(): LeadingParts {
  return { root: { class: leadingAnatomy.classes.root } };
}
