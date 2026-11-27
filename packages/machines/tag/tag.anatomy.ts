import { defineAnatomy, type Anatomy, type AnatomyPart } from '@cocokits/shared';

/** Tag anatomy: one root part, a short status or category label. */
export const tagAnatomy: Anatomy<'tag', { readonly root: AnatomyPart }> = defineAnatomy({
  block: 'tag',
  parts: {
    root: { name: 'Root', description: 'A short status or category label. It holds the text and an optional icon.' },
  },
});
