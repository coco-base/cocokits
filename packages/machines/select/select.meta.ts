import type { ComponentMeta } from '@cocokits/shared';

/** Select meta: data for tests and docs, never read at runtime. */
export const selectMeta: ComponentMeta<
  | 'root'
  | 'trigger'
  | 'placeholder'
  | 'value'
  | 'dropdownIcon'
  | 'content'
  | 'option'
  | 'optionIndicator'
  | 'optionContent'
  | 'optionGroup'
  | 'optionGroupLabel'
  | 'separator'
> = {
  apg: 'https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/',
  dataAttrs: {
    root: [
      'data-state',
      'data-multiple',
      'data-disabled',
      'data-readonly',
      'data-required',
      'data-invalid',
      'data-placeholder-shown',
    ],
    trigger: ['data-state'],
    placeholder: [],
    value: [],
    dropdownIcon: [],
    content: ['data-state', 'data-multiple', 'data-side', 'data-align'],
    option: ['data-selected', 'data-highlighted', 'data-disabled'],
    optionIndicator: [],
    optionContent: [],
    optionGroup: ['data-disabled'],
    optionGroupLabel: [],
    separator: [],
  },
  roles: {
    root: null,
    trigger: 'combobox',
    placeholder: null,
    value: null,
    dropdownIcon: null,
    content: 'listbox',
    option: 'option',
    optionIndicator: null,
    optionContent: null,
    optionGroup: 'group',
    optionGroupLabel: null,
    separator: null,
  },
  keyboard: [
    {
      key: 'ArrowDown, Alt+ArrowDown, Enter, Space',
      context: 'closed',
      action: 'Opens the list and highlights the selected option, else the first enabled one.',
    },
    { key: 'ArrowUp', context: 'closed', action: 'Opens the list and highlights the first enabled option.' },
    {
      key: 'Home / End',
      context: 'closed or open',
      action: 'Closed: opens the list at the first or last enabled option. Open: highlights it.',
    },
    {
      key: 'Printable character',
      context: 'closed or open',
      action:
        'Opens the list if closed and highlights the next option whose text starts with the typed text, ignoring case and accents; a repeated character cycles.',
    },
    {
      key: 'Space',
      context: 'closed or open, while a search is running',
      action: 'Adds a space to the search; does not open or choose.',
    },
    {
      key: 'ArrowDown / ArrowUp',
      context: 'open',
      action: 'Highlights the next or previous enabled option and stops at the ends. Not flipped in rtl.',
    },
    { key: 'PageDown / PageUp', context: 'open', action: 'Moves the highlight by 10 options.' },
    {
      key: 'Enter / Space',
      context: 'open',
      action: 'Chooses the highlighted option. A single Select closes; a multiple one toggles it and stays open.',
    },
    { key: 'Alt+ArrowUp', context: 'open', action: 'Chooses the highlighted option and closes.' },
    {
      key: 'Tab',
      context: 'open',
      action:
        'Single: chooses the highlighted option and closes (as any focus move out of the trigger does); focus moves on. Multiple: closes.',
    },
    { key: 'Escape', context: 'open', action: 'Closes without a change unless the app refuses it.' },
  ],
  defaultElements: {
    root: 'div',
    trigger: 'button',
    placeholder: 'span',
    value: 'span',
    dropdownIcon: 'span',
    content: 'div',
    option: 'div',
    optionIndicator: 'span',
    optionContent: 'span',
    optionGroup: 'div',
    optionGroupLabel: 'div',
    separator: 'div',
  },
  form:
    'The value goes in hidden native inputs (`itemToStringValue(value)`, default `String(value)`; multiple: one ' +
    'input per value) with `name`, `form`, `required`, `disabled` and `autoComplete` (default `off`), so FormData, ' +
    'constraint validation, reset (reason `form-reset`), fieldsets and browser autofill work. An invalid submit ' +
    "moves focus to the trigger, marks the Select invalid and adds the browser's message to the trigger's " +
    'description until the value changes or the form is reset.',
};
