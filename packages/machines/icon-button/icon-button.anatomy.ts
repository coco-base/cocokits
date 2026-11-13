import { defineAnatomy, type Anatomy, type AnatomyPart } from '@cocokits/shared';

/** IconButton anatomy: one root part, the host `<button>` or `<a>` that holds one icon. */
export const iconButtonAnatomy: Anatomy<'icon-button', { readonly root: AnatomyPart }> = defineAnatomy({
  block: 'icon-button',
  parts: {
    root: { name: 'Root', description: 'The host button or link element. It holds one icon and no text.' },
  },
});
