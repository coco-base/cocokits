import { avatarGroupAnatomy } from './avatar-group.anatomy';
import type { AvatarGroupParts } from './avatar-group.types';

/**
 * Computes the root props of an AvatarGroup. Pure. Its avatars must be direct children.
 *
 * @returns The root props: the block class.
 */
export function getAvatarGroupProps(): AvatarGroupParts {
  return { root: { class: avatarGroupAnatomy.classes.root } };
}
