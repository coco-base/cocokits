import { defineAnatomy, type Anatomy, type AnatomyPart } from '@cocokits/shared';

/** Hint anatomy: one root part, a short help text for a control. */
export const hintAnatomy: Anatomy<'hint', { readonly root: AnatomyPart }> = defineAnatomy({
  block: 'hint',
  parts: {
    root: { name: 'Root', description: 'A short help text for a control. It holds the text and an optional icon.' },
  },
});
