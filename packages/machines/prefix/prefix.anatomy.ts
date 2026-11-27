import { defineAnatomy, type Anatomy, type AnatomyPart } from '@cocokits/shared';

/** Prefix anatomy: one root part, content inside the box, before the control. */
export const prefixAnatomy: Anatomy<'prefix', { readonly root: AnatomyPart }> = defineAnatomy({
  block: 'prefix',
  parts: {
    root: {
      name: 'Root',
      description: 'Content inside the box, before the control.',
    },
  },
});
