import { defineAnatomy, type Anatomy, type AnatomyPart } from '@cocokits/shared';

/** BadgeContainer anatomy: one root part that wraps the pinned element and its badges. */
export const badgeContainerAnatomy: Anatomy<'badge-container', { readonly root: AnatomyPart }> = defineAnatomy({
  block: 'badge-container',
  parts: {
    root: { name: 'Root', description: "Wraps the element a badge is pinned to, and that element's badges." },
  },
});
