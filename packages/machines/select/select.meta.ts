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
  dataAttrDetails: {
    'data-state': {
      values: ['open', 'closed'],
      setWhen: 'Always set: `open` while the list is open, `closed` otherwise.',
    },
    'data-multiple': { setWhen: 'The Select takes several values.' },
    'data-disabled': {
      setWhen:
        'The Select is disabled; on an option, the option or its group is disabled; on a group, the group is disabled.',
    },
    'data-readonly': { setWhen: 'The Select is read-only.' },
    'data-required': { setWhen: 'The Select is required.' },
    'data-invalid': { setWhen: 'The Select is invalid, also before any error shows.' },
    'data-placeholder-shown': { setWhen: 'The Select has no value, so the placeholder shows.' },
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
    'data-selected': { setWhen: 'The option is selected.' },
    'data-highlighted': { setWhen: 'The option is the active one, by keyboard or pointer.' },
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
