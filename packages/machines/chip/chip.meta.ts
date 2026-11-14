import type { ComponentMeta } from '@cocokits/shared';

/** Chip meta: data for tests and docs, never read at runtime. */
export const chipMeta: ComponentMeta<'root' | 'contentWrapper' | 'remove'> = {
  dataAttrs: { root: ['data-disabled'], contentWrapper: [], remove: ['data-disabled'] },
  dataAttrDetails: {
    'data-disabled': { setWhen: 'The chip (or, on the remove button, the button) is disabled.' },
  },
  roles: { root: null, contentWrapper: null, remove: null },
  keyboard: [
    {
      key: 'Enter, Space',
      context: 'remove button',
      action: 'Asks to remove the chip (native button activation). The chip never removes itself.',
    },
  ],
  defaultElements: { root: 'div', contentWrapper: 'span', remove: 'button' },
  form: 'None: a chip shows a value and takes no part in a form.',
};
