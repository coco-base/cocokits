import { badgeContainerAnatomy } from './badge-container.anatomy';
import type { BadgeContainerParts, BadgeContainerProps } from './badge-container.types';

/** The defaults of the BadgeContainer inputs, for adapters to use instead of literals. */
export const BADGE_CONTAINER_DEFAULTS = { position: 'top-right' } as const;

/**
 * Computes the root props of a BadgeContainer. Pure. Its badges must be direct children;
 * the theme pins each one to the `position` corner.
 *
 * @param props - The position.
 * @returns The root props, with `data-position`.
 */
export function getBadgeContainerProps({
  position = BADGE_CONTAINER_DEFAULTS.position,
}: BadgeContainerProps = {}): BadgeContainerParts {
  return {
    root: { class: badgeContainerAnatomy.classes.root, 'data-position': position },
  };
}
