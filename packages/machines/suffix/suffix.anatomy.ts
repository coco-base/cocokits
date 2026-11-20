import { defineAnatomy, type Anatomy, type AnatomyPart } from '@cocokits/shared';

/** Suffix anatomy: one root part, content inside the box, after the control. */
export const suffixAnatomy: Anatomy<'suffix', { readonly root: AnatomyPart }> = defineAnatomy({
  block: 'suffix',
  parts: {
    root: {
      name: 'Root',
      description: 'Content inside the box, after the control.',
    },
  },
});
