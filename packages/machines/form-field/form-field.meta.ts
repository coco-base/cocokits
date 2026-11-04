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
  roles: { root: null, wrapper: null, inputWrapper: null, feedbackWrapper: null },
  keyboard: [],
  defaultElements: { root: 'div', wrapper: 'div', inputWrapper: 'div', feedbackWrapper: 'div' },
  form: 'None: a form field lays out a label, a control and its hints, and shows the facts its control reports.',
};
