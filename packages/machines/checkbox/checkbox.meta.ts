import type { ComponentMeta, DataAttrDetail } from '@cocokits/shared';
import { formFieldFactDetails, formFieldStateAttrs } from '../form-field';

/** The root facts of a choice control: the field facts without `data-filled`, plus `data-checked`. */
const choiceRootAttrs: readonly string[] = [
  ...formFieldStateAttrs.filter((attr) => attr !== 'data-filled'),
  'data-checked',
];

/** The `setWhen` text of the facts on a choice root: the field facts without `data-filled`, plus `data-checked`. */
export function choiceAttrDetails(subject: string): Readonly<Record<string, DataAttrDetail>> {
  const facts: Record<string, DataAttrDetail> = { ...formFieldFactDetails(subject) };
  delete facts['data-filled'];
  const first = `${subject.charAt(0).toUpperCase()}${subject.slice(1)}`;
  return { ...facts, 'data-checked': { setWhen: `${first} is checked.` } };
}

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
    ...choiceAttrDetails('the checkbox'),
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
