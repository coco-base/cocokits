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
  dataAttrDetails: {
    'data-state': {
      values: ['open', 'closed'],
      setWhen: 'Always set: `open` while the popover is open, `closed` otherwise.',
    },
    'data-side': {
      values: ['top', 'bottom', 'start', 'end'],
      setWhen:
        'Always set: the side of the anchor the content sits on, the `side` asked for (`bottom` by default) until positioning flips the content to fit.',
    },
    'data-align': {
      values: ['start', 'center', 'end'],
      setWhen:
        'Always set: how the content lines up with the anchor, the `align` asked for (`center` by default) until positioning shifts the content to fit.',
    },
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
