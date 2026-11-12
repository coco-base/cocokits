import type { ComponentMeta } from '@cocokits/shared';

/** Radio group meta: data for tests and docs, never read at runtime. */
export const radioGroupMeta: ComponentMeta<'root'> = {
  apg: 'https://www.w3.org/WAI/ARIA/apg/patterns/radio/',
  dataAttrs: {
    root: ['data-disabled', 'data-required', 'data-orientation'],
  },
  dataAttrDetails: {
    'data-disabled': { setWhen: 'The radio group is disabled.' },
    'data-required': { setWhen: 'A choice in the radio group is required.' },
    'data-orientation': {
      values: ['horizontal', 'vertical'],
      setWhen: 'The orientation prop is set; the attribute is left out otherwise.',
    },
  },
  roles: { root: 'radiogroup' },
  keyboard: [
    {
      key: 'Tab / Shift+Tab',
      context: 'entering the group',
      action: 'Focuses the checked radio, else the first enabled radio (also on Shift+Tab). One tab stop.',
    },
    { key: 'Tab / Shift+Tab', context: 'inside the group', action: 'Leaves the group.' },
    { key: 'Space', context: 'focused radio', action: 'Checks it if it is unchecked (native).' },
    {
      key: 'ArrowDown / ArrowRight',
      context: 'focused radio',
      action:
        'Focuses and checks the next enabled radio; wraps with `loop`. ArrowRight only when `orientation` is not vertical, ArrowDown only when it is not horizontal. In rtl ArrowLeft takes the role of ArrowRight.',
    },
    {
      key: 'ArrowUp / ArrowLeft',
      context: 'focused radio',
      action:
        'Focuses and checks the previous enabled radio; wraps with `loop`. Same orientation filter. In rtl ArrowRight takes the role of ArrowLeft.',
    },
    {
      key: 'Arrow of the blocked axis',
      context: '`orientation` set',
      action: 'Nothing; the browser move is prevented.',
    },
    {
      key: 'Home / End / PageUp / PageDown',
      context: 'focused radio',
      action: 'Not handled by the group (browser default).',
    },
    {
      key: 'Enter',
      context: 'focused radio',
      action: 'Native: submits the owner form (implicit submission). It never checks a radio.',
    },
  ],
  defaultElements: { root: 'div' },
  form:
    "Native: each radio's own input is the form control and all share one `name` (the author's or a generated one); " +
    'no hidden input. FormData holds `name=value` of the checked radio and nothing when none is checked. ' +
    'Group `required` blocks submit while none is checked. After a reset of the owner form the group restores ' +
    'the value it had at mount. No FormField contract.',
};
