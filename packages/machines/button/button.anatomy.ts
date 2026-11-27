import { defineAnatomy, type Anatomy, type AnatomyPart } from '@cocokits/shared';

/** Button anatomy: one root part, the host `<button>` or `<a>`. */
export const buttonAnatomy: Anatomy<'button', { readonly root: AnatomyPart }> = defineAnatomy({
  block: 'button',
  parts: {
    root: { name: 'Root', description: 'The host button or link element.' },
  },
});
