import { defineAnatomy, type Anatomy, type AnatomyPart } from '@cocokits/shared';

/** Label anatomy: the visible label of a control and its required marker. */
export const labelAnatomy: Anatomy<'label', { readonly root: AnatomyPart; readonly requiredMarker: AnatomyPart }> =
  defineAnatomy({
    block: 'label',
    parts: {
      root: { name: 'Root', description: 'The visible label of a control. It holds the label text.' },
      requiredMarker: {
        name: 'Required marker',
        description:
          'The `*` after the label text, shown while the control is required. Hidden from assistive technology.',
      },
    },
  });
