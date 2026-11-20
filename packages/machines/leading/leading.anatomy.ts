import { defineAnatomy, type Anatomy, type AnatomyPart } from '@cocokits/shared';

/** Leading anatomy: one root part, content outside the box, before it. */
export const leadingAnatomy: Anatomy<'leading', { readonly root: AnatomyPart }> = defineAnatomy({
  block: 'leading',
  parts: {
    root: {
      name: 'Root',
      description: 'Content outside the box, before it.',
    },
  },
});
