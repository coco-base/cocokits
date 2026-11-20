import { defineAnatomy, type Anatomy, type AnatomyPart } from '@cocokits/shared';

/** Textarea anatomy: one root part, the native multi-line text control. */
export const textareaAnatomy: Anatomy<'textarea', { readonly root: AnatomyPart }> = defineAnatomy({
  block: 'textarea',
  parts: {
    root: { name: 'Root', description: 'The native multi-line text control. The element is always a `textarea`.' },
  },
});
