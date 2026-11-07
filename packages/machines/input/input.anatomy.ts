import { defineAnatomy, type Anatomy, type AnatomyPart } from '@cocokits/shared';

/** Input anatomy: one root part, the native text control. */
export const inputAnatomy: Anatomy<'input', { readonly root: AnatomyPart }> = defineAnatomy({
  block: 'input',
  parts: {
    root: { name: 'Root', description: 'The native text control. The element is always an `input`.' },
  },
});
