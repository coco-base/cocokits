import type { ComponentMeta } from '@cocokits/shared';
import { formFieldStateAttrs } from '../form-field';

/** The root facts of a choice control: the field facts without `data-filled`, plus `data-checked`. */
const choiceRootAttrs: readonly string[] = [
  ...formFieldStateAttrs.filter((attr) => attr !== 'data-filled'),
  'data-checked',
];

/** Checkbox meta: data for tests and docs, never read at runtime. */
export const checkboxMeta: ComponentMeta<
  'root' | 'wrapper' | 'inputWrapper' | 'input' | 'backdrop' | 'background' | 'label'
> = {
  apg: 'https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/',
  dataAttrs: {
    root: [...choiceRootAttrs, 'data-indeterminate'],
    wrapper: [],
    inputWrapper: [],
    input: [],
    backdrop: [],
    background: [],
    label: [],
  },
  dataAttrDetails: {
    'data-disabled': { setWhen: 'The checkbox is disabled.' },
    'data-readonly': { setWhen: 'The checkbox is read-only.' },
    'data-required': { setWhen: 'The checkbox is required.' },
    'data-invalid': { setWhen: 'The checkbox is invalid, also before any error shows.' },
    'data-pending': { setWhen: 'A validator is still running on the checkbox.' },
    'data-touched': { setWhen: 'The user has left the checkbox.' },
    'data-dirty': { setWhen: 'The user has edited the checkbox.' },
    'data-submitted': { setWhen: 'A submit of the form that holds the checkbox was attempted.' },
    'data-focused': { setWhen: 'The checkbox has focus.' },
    'data-checked': { setWhen: 'The checkbox is checked.' },
    'data-indeterminate': { setWhen: 'The indeterminate prop is true: the checkbox shows the mixed state.' },
  },
  roles: { root: null, wrapper: null, inputWrapper: null, input: null, backdrop: null, background: null, label: null },
  keyboard: [
    {
      key: 'Tab / Shift+Tab',
      context: 'checkbox',
      action: 'Moves focus in and out. A disabled checkbox is skipped; a read-only one stays focusable (native).',
    },
    {
      key: 'Space',
      context: 'checkbox',
      action:
        'Toggles the checkbox (blocked while read-only). On a mixed checkbox the mixed state stays until the parent changes `indeterminate`.',
    },
  ],
  defaultElements: {
    root: 'div',
    wrapper: 'span',
    inputWrapper: 'span',
    input: 'input',
    backdrop: 'span',
    background: 'span',
    label: 'label',
  },
  form:
    'Native: the input is the form control, so FormData (`name=on`, or the value, while checked), constraint ' +
    'validation, reset, the `form` attribute and fieldsets work as plain HTML. No hidden input.',
};
