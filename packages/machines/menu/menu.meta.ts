import type { ComponentMeta } from '@cocokits/shared';

/** Menu meta: data for tests and docs, never read at runtime. */
export const menuMeta: ComponentMeta<
  | 'root'
  | 'trigger'
  | 'content'
  | 'item'
  | 'checkboxItem'
  | 'radioGroup'
  | 'radioItem'
  | 'itemIndicator'
  | 'group'
  | 'groupLabel'
  | 'itemLeading'
  | 'itemTrailing'
  | 'itemSupportingText'
  | 'itemShortcut'
  | 'sub'
  | 'subTrigger'
  | 'subContent'
> = {
  apg: 'https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/',
  dataAttrs: {
    root: [],
    trigger: ['data-state'],
    content: ['data-state', 'data-side', 'data-align'],
    item: ['data-disabled'],
    checkboxItem: ['data-state', 'data-disabled', 'data-highlighted'],
    radioGroup: [],
    radioItem: ['data-state', 'data-disabled', 'data-highlighted'],
    itemIndicator: ['data-state'],
    group: [],
    groupLabel: [],
    itemLeading: [],
    itemTrailing: [],
    itemSupportingText: [],
    itemShortcut: [],
    sub: [],
    subTrigger: ['data-state', 'data-disabled', 'data-highlighted'],
    subContent: ['data-state', 'data-side', 'data-align'],
  },
  dataAttrDetails: {
    'data-state': {
      values: ['open', 'closed', 'checked', 'unchecked'],
      setWhen:
        'Always set on the trigger, the content, the sub-trigger and the sub-content: `open` while the menu is open, `closed` otherwise (the content keeps `closed` while it exits). On a checkbox item, a radio item and an item indicator: `checked` or `unchecked`.',
    },
    'data-highlighted': {
      setWhen: 'The checkbox item, radio item or sub-trigger is the active item of an open menu.',
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
  roles: {
    root: null,
    trigger: null,
    content: 'menu',
    item: 'menuitem',
    checkboxItem: 'menuitemcheckbox',
    radioGroup: 'group',
    radioItem: 'menuitemradio',
    itemIndicator: null,
    group: 'group',
    groupLabel: null,
    itemLeading: null,
    itemTrailing: null,
    itemSupportingText: null,
    itemShortcut: null,
    sub: null,
    subTrigger: 'menuitem',
    subContent: 'menu',
  },
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
    {
      key: 'Enter',
      context: 'Menu checkbox or radio item',
      action: 'Toggles the checkbox item or checks the radio item, and closes the menu (focus goes to the trigger).',
    },
    {
      key: 'Space',
      context: 'Menu checkbox or radio item',
      action: 'Toggles the checkbox item or checks the radio item and keeps the menu open (optional in the pattern).',
    },
    {
      key: 'ArrowRight, Enter, Space',
      context: 'Sub-trigger',
      action: 'Opens the submenu and focuses its first item. In rtl ArrowLeft opens it.',
    },
    {
      key: 'ArrowLeft',
      context: 'Submenu',
      action: 'Closes the submenu and focuses its sub-trigger. In rtl ArrowRight closes it.',
    },
    { key: 'Escape', context: 'Submenu', action: 'Closes only the submenu and focuses its sub-trigger.' },
    { key: 'Escape', context: 'Menu', action: 'Closes the topmost layer only and focuses the trigger.' },
    { key: 'Tab', context: 'Menu', action: 'Closes the menu and moves focus to the element after the trigger.' },
    { key: 'Shift+Tab', context: 'Menu', action: 'Closes the menu and focuses the trigger.' },
  ],
  defaultElements: {
    trigger: 'button',
    content: 'div',
    item: 'div',
    checkboxItem: 'div',
    radioGroup: 'div',
    radioItem: 'div',
    itemIndicator: 'span',
    group: 'div',
    groupLabel: 'div',
    itemLeading: 'span',
    itemTrailing: 'span',
    itemSupportingText: 'span',
    itemShortcut: 'span',
    subTrigger: 'div',
    subContent: 'div',
  },
  form: 'None: a menu runs actions and holds no value. A checkbox item and a radio group hold state for the app, not a form value.',
};
