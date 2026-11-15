import type { ComponentMeta } from '@cocokits/shared';

/** Menu meta: data for tests and docs, never read at runtime. */
export const menuMeta: ComponentMeta<'root' | 'trigger' | 'content' | 'item'> = {
  apg: 'https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/',
  dataAttrs: {
    root: [],
    trigger: ['data-state'],
    content: ['data-state', 'data-side', 'data-align'],
    item: ['data-disabled'],
  },
  dataAttrDetails: {
    'data-state': {
      values: ['open', 'closed'],
      setWhen:
        'Always set: `open` while the menu is open, `closed` otherwise (the content keeps `closed` while it exits).',
    },
    'data-side': {
      values: ['top', 'bottom', 'start', 'end'],
      default: 'bottom',
      setWhen:
        'Always set: the side of the trigger the content sits on, the `side` asked for until positioning flips the content to fit.',
    },
    'data-align': {
      values: ['start', 'center', 'end'],
      default: 'start',
      setWhen:
        'Always set: how the content lines up with the trigger, the `align` asked for until positioning shifts the content to fit.',
    },
    'data-disabled': { setWhen: 'The item is disabled. It stays focusable and runs nothing.' },
  },
  roles: { root: null, trigger: null, content: 'menu', item: 'menuitem' },
  keyboard: [
    {
      key: 'Enter, Space',
      context: 'Trigger',
      action: 'Opens the menu (the native click) and focuses the first item; closes it when open.',
    },
    { key: 'ArrowDown', context: 'Trigger', action: 'Opens the menu and focuses the first item.' },
    { key: 'ArrowUp', context: 'Trigger', action: 'Opens the menu and focuses the last item.' },
    {
      key: 'ArrowDown, ArrowUp',
      context: 'Menu',
      action: 'Focuses the next or previous item and wraps at the ends. Not flipped in rtl.',
    },
    { key: 'Home, End', context: 'Menu', action: 'Focuses the first or last item.' },
    {
      key: 'Printable character',
      context: 'Menu',
      action:
        'Focuses the next item whose text starts with the typed text, ignoring case and accents; a repeated character cycles. Space extends a running search.',
    },
    {
      key: 'Enter, Space',
      context: 'Menu item',
      action:
        'Runs an enabled item (a click) and closes the menu unless the item event is prevented; focus goes to the trigger. Nothing on a disabled item.',
    },
    { key: 'Escape', context: 'Menu', action: 'Closes the topmost layer only and focuses the trigger.' },
    { key: 'Tab', context: 'Menu', action: 'Closes the menu and moves focus to the element after the trigger.' },
    { key: 'Shift+Tab', context: 'Menu', action: 'Closes the menu and focuses the trigger.' },
  ],
  defaultElements: { trigger: 'button', content: 'div', item: 'div' },
  form: 'None: a menu runs actions and holds no value.',
};
