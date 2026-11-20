import type { ComponentMeta } from '@cocokits/shared';

/** Chip meta: data for tests and docs, never read at runtime. */
export const chipMeta: ComponentMeta<'root' | 'contentWrapper' | 'check' | 'remove'> = {
  apg: 'https://www.w3.org/WAI/ARIA/apg/patterns/button/',
  dataAttrs: { root: ['data-disabled'], contentWrapper: ['data-selected'], check: ['data-state'], remove: [] },
  dataAttrDetails: {
    'data-disabled': { setWhen: 'The chip is disabled.' },
    'data-selected': { setWhen: 'The chip is selectable and selected.' },
    'data-state': { values: ['checked'], setWhen: 'The check of a selectable chip, while the chip is selected.' },
  },
  roles: { root: null, contentWrapper: null, check: null, remove: null },
  keyboard: [
    {
      key: 'Enter, Space',
      context: 'selectable chip',
      action: 'Toggles `selected` (native button activation). The label does not change; `aria-pressed` does.',
    },
    {
      key: 'Enter, Space',
      context: 'remove button',
      action: 'Asks to remove the chip (native button activation). The chip never removes itself.',
    },
  ],
  defaultElements: { root: 'div', contentWrapper: 'span', check: 'span', remove: 'button' },
  form: 'None: a chip shows a value and takes no part in a form.',
};
