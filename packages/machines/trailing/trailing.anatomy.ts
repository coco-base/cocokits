import { defineAnatomy, type Anatomy, type AnatomyPart } from '@cocokits/shared';

/** Trailing anatomy: one root part, content outside the box, after it. */
export const trailingAnatomy: Anatomy<'trailing', { readonly root: AnatomyPart }> = defineAnatomy({
  block: 'trailing',
  parts: {
    root: {
      name: 'Root',
      description: 'Content outside the box, after it.',
    },
  },
});
