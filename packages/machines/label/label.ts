import { labelAnatomy } from './label.anatomy';
import type { LabelProps, LabelParts } from './label.types';

/**
 * Computes the props of a Label. Pure.
 *
 * @param input - The `for` to render and the required state; leave it out outside a field.
 * @returns The root props, and the marker props only while `required` is true and the marker is not hidden.
 */
export function getLabelProps(input?: LabelProps): LabelParts {
  const { classes } = labelAnatomy;
  const showMarker = Boolean(input?.required) && !input?.hideRequiredMarker;
  return {
    root: { class: classes.root, ...(input?.for ? { for: input.for } : {}), ...(input?.id ? { id: input.id } : {}) },
    requiredMarker: showMarker ? { class: classes.requiredMarker, 'aria-hidden': 'true', text: '*' } : null,
  };
}
