import { defineAnatomy, type Anatomy, type AnatomyPart } from '@cocokits/shared';

/** Divider anatomy: the line that separates content. */
export const dividerAnatomy: Anatomy<'divider', { readonly root: AnatomyPart }> = defineAnatomy({
  block: 'divider',
  parts: {
    root: { name: 'Root', description: 'The line that separates content.' },
  },
});
