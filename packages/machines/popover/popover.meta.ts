import type { ComponentMeta } from '@cocokits/shared';

/**
 * Popover meta: data for tests and docs, never read at runtime. APG has no popover pattern, so the link
 * is the Dialog pattern of the content, which a Popover follows without the modal parts.
 */
export const popoverMeta: ComponentMeta<
  'root' | 'trigger' | 'anchor' | 'content' | 'arrow' | 'title' | 'description' | 'close'
> = {
  apg: 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/',
  dataAttrs: {
    root: [],
    trigger: ['data-state'],
    anchor: [],
    content: ['data-state', 'data-side', 'data-align'],
    arrow: [],
    title: [],
    description: [],
    close: [],
  },
  roles: {
    root: null,
    trigger: null,
    anchor: null,
    content: 'dialog',
    arrow: null,
    title: null,
    description: null,
    close: null,
  },
  keyboard: [
    { key: 'Enter / Space', context: 'trigger', action: 'Native. Toggles the popover.' },
    {
      key: 'Tab / Shift+Tab',
      context: 'inside the content',
      action:
        'Moves to the next or previous focusable element. Past the last or first one focus goes to the element ' +
        'after or back to the trigger, and the popover closes (focus guards and focus-out, cdk).',
    },
    {
      key: 'Escape',
      context: 'inside the content',
      action: 'Closes the topmost layer only, through the dismissal stack (cdk), and focuses the trigger.',
    },
    {
      key: 'Tab / Shift+Tab',
      context: 'inside the content of a modal popover',
      frameworks: ['react', 'vue'],
      action:
        'Moves to the next or previous focusable element, wrapping from the last to the first and from the first ' +
        'to the last. Focus never leaves the content; everything outside is inert.',
    },
  ],
  defaultElements: {
    trigger: 'button',
    anchor: 'div',
    content: 'div',
    arrow: 'span',
    title: 'h2',
    description: 'p',
    close: 'button',
  },
  form: 'None: Popover is not a form control.',
};
