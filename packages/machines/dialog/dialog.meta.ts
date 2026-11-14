import type { ComponentMeta } from '@cocokits/shared';

/** Dialog meta: data for tests and docs, never read at runtime. */
export const dialogMeta: ComponentMeta<'root' | 'trigger' | 'content' | 'title' | 'description' | 'close'> = {
  apg: 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/',
  dataAttrs: {
    root: [],
    trigger: ['data-state'],
    content: ['data-state'],
    title: [],
    description: [],
    close: [],
  },
  dataAttrDetails: {
    'data-state': {
      values: ['open', 'closed'],
      setWhen: 'Always set: `open` while the dialog is open, `closed` otherwise.',
    },
  },
  roles: { root: null, trigger: null, content: null, title: null, description: null, close: null },
  keyboard: [
    { key: 'Enter / Space', context: 'trigger', action: 'Native. Opens the dialog.' },
    {
      key: 'Tab / Shift+Tab',
      context: 'inside the dialog',
      action: 'Native (modal dialog). Moves to the next or previous focusable element.',
    },
    {
      key: 'Escape',
      context: 'inside the dialog',
      action: 'Closes the topmost layer only, through the dismissal stack (cdk). Focus returns to the trigger.',
    },
  ],
  defaultElements: {
    trigger: 'button',
    content: 'dialog',
    title: 'h2',
    description: 'p',
    close: 'button',
  },
  form: 'None: Dialog is not a form control. A `<form method="dialog">` inside closes it with reason `close`.',
};
