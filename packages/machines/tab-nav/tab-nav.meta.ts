import type { ComponentMeta } from '@cocokits/shared';

/** The roles panel mode adds: the list becomes a `tablist` and each link a `tab`. `tabNavMeta.roles` is link mode. */
export const tabNavPanelModeRoles = { list: 'tablist', link: 'tab' } as const;

/**
 * TabNav meta: data for tests and docs, never read at runtime. APG has no pattern for link tabs; panel mode
 * follows the APG Tabs pattern, with the roles of {@link tabNavPanelModeRoles}.
 */
export const tabNavMeta: ComponentMeta<'root' | 'list' | 'link' | 'indicator' | 'panel'> = {
  dataAttrs: {
    root: [],
    list: [],
    link: ['data-active', 'data-disabled'],
    indicator: [],
    panel: [],
  },
  dataAttrDetails: {
    'data-active': {
      setWhen: 'The link is the active one: the current page, or the selected tab when the TabNav shows panels.',
    },
    'data-disabled': { setWhen: 'The link is disabled.' },
  },
  roles: { root: null, list: null, link: null, indicator: null, panel: 'tabpanel' },
  keyboard: [
    {
      key: 'Tab / Shift+Tab',
      context: 'links',
      action: 'Native. Moves focus between the links. A disabled link is out of the tab order.',
    },
    { key: 'Enter', context: 'link', action: 'Native. Follows the link. Blocked on a disabled link.' },
    {
      key: 'Tab (panel mode)',
      context: 'outside the list',
      action: 'Native. Focuses the one tab stop, the active link or else the first enabled link, then the panel.',
    },
    {
      key: 'ArrowRight / ArrowLeft',
      context: 'link, panel mode',
      action: 'Moves focus to the next or previous enabled link, wrapping; never navigates. Flipped in rtl.',
    },
    {
      key: 'Home / End',
      context: 'link, panel mode',
      action: 'Moves focus to the first or last enabled link; never navigates. Not flipped in rtl.',
    },
    {
      key: 'Space',
      context: 'link, panel mode',
      action: 'Activates the link (a click) and does not scroll the page. Enter stays the native activation.',
    },
  ],
  defaultElements: { root: 'nav', list: 'div', link: 'a', indicator: 'span', panel: 'div' },
  form: 'None: TabNav is not a form control.',
};
