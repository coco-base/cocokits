import { defineAnatomy, type Anatomy, type AnatomyPart } from '@cocokits/shared';

/** FieldError anatomy: one root part, an error message of a form field. */
export const fieldErrorAnatomy: Anatomy<'field-error', { readonly root: AnatomyPart }> = defineAnatomy({
  block: 'field-error',
  parts: {
    root: {
      name: 'Root',
      description:
        'An error message of the field. It is a polite live region that is always rendered; its content shows ' +
        'while the field is invalid and was touched or submitted, or always with `force`; outside a FormField ' +
        'it always shows.',
    },
  },
});
