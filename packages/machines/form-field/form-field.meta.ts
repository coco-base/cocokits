import type { ComponentMeta, DataAttrDetail } from '@cocokits/shared';
import { formFieldStateAttrs } from './form-field';

/**
 * The `setWhen` text of the ten field facts for a control called `subject` ("the checkbox"). The field root and
 * every control that renders the facts share it. It is shared by the Checkbox and the Switch meta.
 */
export function formFieldFactDetails(
  subject: string,
): Readonly<Record<(typeof formFieldStateAttrs)[number], DataAttrDetail>> {
  const first = `${subject.charAt(0).toUpperCase()}${subject.slice(1)}`;
  return {
    'data-disabled': { setWhen: `${first} is disabled.` },
    'data-readonly': { setWhen: `${first} is read-only.` },
    'data-required': { setWhen: `${first} is required.` },
    'data-invalid': { setWhen: `${first} is invalid, before any error shows.` },
    'data-pending': { setWhen: `A validator is still running on ${subject}.` },
    'data-touched': { setWhen: `The user has left ${subject}.` },
    'data-dirty': { setWhen: `The user has edited ${subject}.` },
    'data-submitted': { setWhen: `A submit of the form that holds ${subject} was attempted.` },
    'data-focused': { setWhen: `${first} has focus.` },
    'data-filled': { setWhen: `${first} has a value.` },
  };
}

/** FormField meta: data for tests and docs, never read at runtime. */
export const formFieldMeta: ComponentMeta<'root' | 'wrapper' | 'inputWrapper' | 'feedbackWrapper'> = {
  dataAttrs: {
    root: [...formFieldStateAttrs],
    wrapper: [],
    inputWrapper: [],
    feedbackWrapper: [],
  },
  dataAttrDetails: formFieldFactDetails('the field or its control'),
  roles: { root: null, wrapper: null, inputWrapper: null, feedbackWrapper: null },
  keyboard: [],
  defaultElements: { root: 'div', wrapper: 'div', inputWrapper: 'div', feedbackWrapper: 'div' },
  form: 'None: a form field lays out a label, a control and its hints, and shows the facts its control reports.',
};
