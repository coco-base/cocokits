import type { ComponentMeta } from '@cocokits/shared';

/** Button meta: data for tests and docs, never read at runtime. */
export const buttonMeta: ComponentMeta<'root'> = {
  apg: 'https://www.w3.org/WAI/ARIA/apg/patterns/button/',
  dataAttrs: { root: ['data-disabled'] },
  roles: { root: null },
  keyboard: [
    {
      key: 'Enter',
      context: 'button, a[href]',
      action: 'Activates the button or follows the link (native). Blocked on a disabled link.',
    },
    { key: 'Space', context: 'button', action: 'Activates the button (native). Nothing on a link.' },
    {
      key: 'Tab / Shift+Tab',
      context: 'both',
      action: 'Moves focus in and out. A disabled button and a disabled link are skipped.',
    },
  ],
  form: 'Native only: type, form, name, value and the form* attributes work as plain HTML.',
};
