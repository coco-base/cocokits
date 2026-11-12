import type { ComponentMeta } from '@cocokits/shared';
import { checkboxMeta, choiceAttrDetails } from '../checkbox';

/** Switch meta: data for tests and docs, never read at runtime. */
export const switchMeta: ComponentMeta<'root' | 'label' | 'track' | 'input' | 'thumb' | 'backdrop'> = {
  apg: 'https://www.w3.org/WAI/ARIA/apg/patterns/switch/',
  dataAttrs: {
    root: checkboxMeta.dataAttrs.root.filter((attr) => attr !== 'data-indeterminate'),
    label: [],
    track: [],
    input: [],
    thumb: [],
    backdrop: [],
  },
  dataAttrDetails: choiceAttrDetails('the switch'),
  roles: { root: null, label: null, track: null, input: 'switch', thumb: null, backdrop: null },
  keyboard: [
    {
      key: 'Tab / Shift+Tab',
      context: 'switch',
      action: 'Moves focus in and out. A disabled switch is skipped; a read-only one stays focusable (native).',
    },
    { key: 'Space', context: 'switch', action: 'Toggles the switch (blocked while read-only).' },
  ],
  defaultElements: { root: 'div', label: 'label', track: 'span', input: 'input', thumb: 'span', backdrop: 'span' },
  form:
    'Native: the input is the form control, so FormData (`name=on`, or the value, while checked), constraint ' +
    'validation, reset, the `form` attribute and fieldsets work as plain HTML. No hidden input.',
};
