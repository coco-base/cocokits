import type { ComponentMeta } from '@cocokits/shared';

/** Accordion meta: data for tests and docs, never read at runtime. */
export const accordionMeta: ComponentMeta<'root' | 'item' | 'header' | 'trigger' | 'content'> = {
  apg: 'https://www.w3.org/WAI/ARIA/apg/patterns/accordion/',
  dataAttrs: {
    root: ['data-orientation', 'data-disabled', 'data-multiple'],
    item: ['data-state', 'data-disabled', 'data-orientation'],
    header: ['data-state', 'data-disabled', 'data-orientation'],
    trigger: ['data-state', 'data-disabled', 'data-orientation', 'data-focus-visible'],
    content: ['data-state', 'data-disabled', 'data-orientation'],
  },
  roles: { root: null, item: null, header: null, trigger: null, content: 'region' },
  keyboard: [
    {
      key: 'Enter / Space',
      context: 'trigger',
      action:
        'Native. The button click toggles its item. It does nothing on a disabled trigger, or on an open trigger that cannot be collapsed.',
    },
    {
      key: 'Tab / Shift+Tab',
      context: 'page',
      action: 'Native. Every enabled trigger is a stop; the focusable content of an open item follows its trigger.',
    },
    {
      key: 'ArrowDown / ArrowUp',
      context: 'trigger, vertical',
      action: 'Moves to the next or previous enabled trigger of the same accordion, wrapping. Not flipped in rtl.',
    },
    {
      key: 'ArrowRight / ArrowLeft',
      context: 'trigger, horizontal',
      action: 'Moves to the next or previous enabled trigger of the same accordion, wrapping. Flipped in rtl.',
    },
    { key: 'Home / End', context: 'trigger', action: 'Moves to the first or last enabled trigger.' },
  ],
  defaultElements: { root: 'div', item: 'div', header: 'h3', trigger: 'button', content: 'div' },
  form: 'None: Accordion is not a form control.',
};
