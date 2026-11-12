import type { ComponentMeta } from '@cocokits/shared';
import { formFieldStateAttrs } from './form-field';

/** FormField meta: data for tests and docs, never read at runtime. */
export const formFieldMeta: ComponentMeta<'root' | 'wrapper' | 'inputWrapper' | 'feedbackWrapper'> = {
  dataAttrs: {
    root: [...formFieldStateAttrs],
    wrapper: [],
    inputWrapper: [],
    feedbackWrapper: [],
  },
  dataAttrDetails: {
    'data-disabled': { setWhen: 'The field or its control is disabled.' },
    'data-readonly': { setWhen: 'The field or its control is read-only.' },
    'data-required': { setWhen: 'The field or its control is required.' },
    'data-invalid': { setWhen: 'The field or its control is invalid, before any error shows.' },
    'data-pending': { setWhen: 'A validator is still running on the field or its control.' },
    'data-touched': { setWhen: 'The user has left the field or its control.' },
    'data-dirty': { setWhen: 'The user has edited the field or its control.' },
    'data-submitted': { setWhen: 'A submit of the form that holds the field or its control was attempted.' },
    'data-focused': { setWhen: 'The field or its control has focus.' },
    'data-filled': { setWhen: 'The field or its control has a value.' },
  },
  roles: { root: null, wrapper: null, inputWrapper: null, feedbackWrapper: null },
  keyboard: [],
  defaultElements: { root: 'div', wrapper: 'div', inputWrapper: 'div', feedbackWrapper: 'div' },
  form: 'None: a form field lays out a label, a control and its hints, and shows the facts its control reports.',
};
