import type { ComponentMeta } from '@cocokits/shared';

/** Checkbox group meta: data for tests and docs, never read at runtime. */
export const checkboxGroupMeta: ComponentMeta<'root'> = {
  apg: 'https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/',
  dataAttrs: { root: ['data-disabled', 'data-orientation'] },
  dataAttrDetails: {
    'data-disabled': { setWhen: 'The group, or its FormField, is disabled.' },
    'data-orientation': {
      values: ['vertical', 'horizontal'],
      default: 'vertical',
      setWhen: 'Always set: the orientation the theme lays the checkboxes out in.',
    },
  },
  roles: { root: 'group' },
  keyboard: [
    {
      key: 'Tab / Shift+Tab',
      context: 'checkbox in the group',
      action: 'Native: each enabled checkbox is its own tab stop. The group adds no key.',
    },
    {
      key: 'Space',
      context: 'checkbox in the group',
      action: 'Native: toggles the checkbox and its value in the group.',
    },
  ],
  defaultElements: { root: 'div' },
  form:
    'Native: each checkbox is its own form control and shares the `name` of the group (`name=value` for each ' +
    'checked one). No hidden input. Inside a FormField the group is the labelled element: the Label names it ' +
    'through `aria-labelledby`, and the hints and errors describe it.',
};
