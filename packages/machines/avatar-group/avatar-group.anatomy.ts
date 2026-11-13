import { defineAnatomy, type Anatomy, type AnatomyPart } from '@cocokits/shared';

/** AvatarGroup anatomy: one root part that lays out its avatars. */
export const avatarGroupAnatomy: Anatomy<'avatar-group', { readonly root: AnatomyPart }> = defineAnatomy({
  block: 'avatar-group',
  parts: {
    root: { name: 'Root', description: 'Lays out several avatars, which must be its direct children, overlapping.' },
  },
});
