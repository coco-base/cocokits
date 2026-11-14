import { defineAnatomy, type Anatomy, type AnatomyPart } from '@cocokits/shared';

/** Chip list anatomy: a root that holds one chip per value, then the text box that adds a value. */
export const chipListAnatomy: Anatomy<'chip-list', { readonly root: AnatomyPart; readonly input: AnatomyPart }> =
  defineAnatomy({
    block: 'chip-list',
    parts: {
      root: {
        name: 'Root',
        description:
          'The box. It holds one chip per value, then the text box, and renders the facts as `data-*`; it has no role.',
      },
      input: {
        name: 'Input',
        description:
          'The text box the user types a new value into; the control of a FormField. The element is always an `input`.',
      },
    },
  });
