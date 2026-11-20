import { defineAnatomy, type Anatomy, type AnatomyPart } from '@cocokits/shared';

/** Checkbox group anatomy: one root around the checkboxes. The checkboxes are `Checkbox` components with their own anatomy. */
export const checkboxGroupAnatomy: Anatomy<'checkbox-group', { readonly root: AnatomyPart }> = defineAnatomy({
  block: 'checkbox-group',
  parts: {
    root: {
      name: 'Root',
      description:
        'The `group`. It holds the checkboxes, keeps the list of the checked values and renders the group state as `data-*`. A Label inside a FormField, `aria-label` or `aria-labelledby` names it.',
    },
  },
});
