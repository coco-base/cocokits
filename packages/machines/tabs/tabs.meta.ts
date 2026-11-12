import type { ComponentMeta } from '@cocokits/shared';

/** Tabs meta: data for tests and docs, never read at runtime. */
export const tabsMeta: ComponentMeta<'root' | 'list' | 'trigger' | 'triggerLabel' | 'indicator' | 'panel'> = {
  apg: 'https://www.w3.org/WAI/ARIA/apg/patterns/tabs/',
  dataAttrs: {
    root: ['data-orientation'],
    list: ['data-orientation'],
    trigger: ['data-orientation', 'data-selected', 'data-disabled', 'data-focus-visible'],
    triggerLabel: [],
    indicator: [],
    panel: ['data-orientation', 'data-selected'],
  },
  dataAttrDetails: {
    'data-orientation': {
      values: ['horizontal', 'vertical'],
      setWhen: 'Always set: the direction of the tabs, `horizontal` unless the orientation prop says otherwise.',
    },
    'data-selected': { setWhen: 'The tab is selected; on a panel, its tab is selected.' },
    'data-disabled': { setWhen: 'The tab is disabled.' },
    'data-focus-visible': { setWhen: 'The tab has focus that came from the keyboard.' },
  },
  roles: { root: null, list: 'tablist', trigger: 'tab', triggerLabel: null, indicator: null, panel: 'tabpanel' },
  keyboard: [
    { key: 'Tab', context: 'outside the list', action: 'Native. Focuses the tab stop: the selected tab.' },
    { key: 'Tab (on a tab)', context: 'tab', action: 'Native. Focuses the selected panel, which has tabindex 0.' },
    {
      key: 'ArrowRight / ArrowLeft',
      context: 'horizontal list',
      action:
        'Moves to the next or previous enabled tab, wrapping unless the adapter offers `loop` and it is false; selects it in automatic mode. Flipped in rtl.',
    },
    {
      key: 'ArrowDown / ArrowUp',
      context: 'vertical list',
      action:
        'Moves to the next or previous enabled tab, wrapping unless the adapter offers `loop` and it is false; selects it in automatic mode. Not flipped in rtl.',
    },
    {
      key: 'Home / End',
      context: 'list',
      action: 'Moves to the first or last enabled tab; selects it in automatic mode. Never flipped in rtl.',
    },
    { key: 'Enter / Space', context: 'tab, manual mode', action: 'Native. The button click selects the focused tab.' },
  ],
  defaultElements: {
    root: 'div',
    list: 'div',
    trigger: 'button',
    triggerLabel: 'span',
    indicator: 'span',
    panel: 'div',
  },
  form: 'None: Tabs is not a form control.',
};
