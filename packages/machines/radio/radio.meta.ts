import type { ComponentMeta } from '@cocokits/shared';

/** Radio meta: data for tests and docs, never read at runtime. */
export const radioMeta: ComponentMeta<
  'root' | 'wrapper' | 'inputWrapper' | 'input' | 'backdrop' | 'background' | 'label'
> = {
  apg: 'https://www.w3.org/WAI/ARIA/apg/patterns/radio/',
  dataAttrs: {
    root: ['data-checked', 'data-disabled', 'data-required'],
    wrapper: [],
    inputWrapper: [],
    input: [],
    backdrop: [],
    background: [],
    label: [],
  },
  dataAttrDetails: {
    'data-checked': { setWhen: 'The radio is selected.' },
    'data-disabled': { setWhen: 'The radio is disabled.' },
    'data-required': { setWhen: 'A choice in the radio group is required.' },
  },
  roles: { root: null, wrapper: null, inputWrapper: null, input: null, backdrop: null, background: null, label: null },
  keyboard: [
    {
      key: 'Tab / Shift+Tab',
      context: 'radio group (same name)',
      action:
        'One tab stop: into the checked radio, else the first (native). With none checked, Shift+Tab may land on the last. A disabled radio is skipped. Inside a Radio group the group sets the tab stop.',
    },
    { key: 'Space', context: 'radio', action: 'Checks the focused radio.' },
    {
      key: 'Arrow keys',
      context: 'radio group (same name)',
      action:
        'Focus and check the next or previous radio of the group, wrapping (native). Left and Right follow the direction of the browser. Inside a Radio group the keys of the group apply.',
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
    'Native: the input is the form control. Radios with the same `name` form a native group; FormData holds ' +
    '`name=on` (or the value) for the checked one. No hidden input and no FormField contract.',
};
