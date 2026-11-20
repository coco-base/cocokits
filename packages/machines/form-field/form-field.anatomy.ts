import { defineAnatomy, type Anatomy, type AnatomyPart } from '@cocokits/shared';

/** FormField anatomy: the root, the control zone and the feedback zone. */
export const formFieldAnatomy: Anatomy<
  'form-field',
  {
    readonly root: AnatomyPart;
    readonly wrapper: AnatomyPart;
    readonly inputWrapper: AnatomyPart;
    readonly feedbackWrapper: AnatomyPart;
  }
> = defineAnatomy({
  block: 'form-field',
  parts: {
    root: {
      name: 'Root',
      description: 'The root of the field. It holds the label, the control zone and the feedback zone, in that order.',
    },
    wrapper: { name: 'Wrapper', description: 'Holds the leading zone, the input wrapper and the trailing zone.' },
    inputWrapper: {
      name: 'Input wrapper',
      description: 'Holds the prefix, the control and the suffix; a click on it focuses the control.',
    },
    feedbackWrapper: { name: 'Feedback wrapper', description: 'Stacks the hints, then the errors.' },
  },
});
