import { defineAnatomy, type Anatomy, type AnatomyPart } from '@cocokits/shared';

/** Radio group anatomy: one root around the radios. The radios are `Radio` components with their own anatomy. */
export const radioGroupAnatomy: Anatomy<
  'radio-group',
  {
    readonly root: AnatomyPart;
  }
> = defineAnatomy({
  block: 'radio-group',
  parts: {
    root: {
      name: 'Root',
      description:
        'The `radiogroup`. It holds the radios, renders the group state as `data-*` and ARIA, and handles the arrow keys.',
    },
  },
});
