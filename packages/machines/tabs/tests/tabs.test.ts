import { describe, expect, it, vi } from 'vitest';
import {
  getTabsProps,
  resolveSelectedTab,
  tabsAnatomy,
  tabsIds,
  tabsKeymap,
  tabsMeta,
  transitionTabs,
  type TabsItem,
  type TabsState,
} from '../index';

const items: TabsItem[] = [
  { value: 'account' },
  { value: 'password', disabled: true },
  { value: 'alerts' },
  { value: 'extra' },
];

const base = (over: Partial<TabsState> = {}): TabsState => ({ id: 'tabs-1', items, ...over });

describe('anatomy and classes', () => {
  it('renders the part classes', () => {
    const parts = getTabsProps(base(), vi.fn());
    expect(tabsAnatomy.classes).toMatchObject({
      root: 'cck-tabs',
      list: 'cck-tabs__list',
      trigger: 'cck-tabs__trigger',
      triggerLabel: 'cck-tabs__trigger-label',
      indicator: 'cck-tabs__indicator',
      panel: 'cck-tabs__panel',
    });
    expect(parts.root.class).toBe('cck-tabs');
    expect(parts.list.class).toBe('cck-tabs__list');
    expect(parts.indicator.class).toBe('cck-tabs__indicator');
    expect(parts.triggerLabel.class).toBe('cck-tabs__trigger-label');
    expect(parts.trigger({ value: 'account' }).class).toBe('cck-tabs__trigger');
    expect(parts.panel({ value: 'account' }).class).toBe('cck-tabs__panel');
  });
});

describe('resolveSelectedTab', () => {
  it('is the given value, even before its tab is registered', () => {
    expect(resolveSelectedTab([], 'alerts')).toBe('alerts');
    expect(resolveSelectedTab(items, 'extra')).toBe('extra');
  });

  it('is the first enabled tab when no value is given', () => {
    expect(resolveSelectedTab(items, undefined)).toBe('account');
    expect(resolveSelectedTab([{ value: 'a', disabled: true }, { value: 'b' }], undefined)).toBe('b');
  });

  it('is undefined with no value and no enabled tab', () => {
    expect(resolveSelectedTab([], undefined)).toBeUndefined();
    expect(resolveSelectedTab([{ value: 'a', disabled: true }], undefined)).toBeUndefined();
  });
});

describe('roles and ARIA', () => {
  it('gives the list the tablist role, and aria-orientation only when vertical', () => {
    expect(getTabsProps(base(), vi.fn()).list.role).toBe('tablist');
    expect(getTabsProps(base(), vi.fn()).list['aria-orientation']).toBeUndefined();
    expect(getTabsProps(base({ orientation: 'vertical' }), vi.fn()).list['aria-orientation']).toBe('vertical');
  });

  it('wires tab and panel to each other with ids made from the id and the encoded value', () => {
    const parts = getTabsProps(base({ value: 'alerts' }), vi.fn());
    const trigger = parts.trigger({ value: 'alerts' });
    const panel = parts.panel({ value: 'alerts' });
    expect(trigger).toMatchObject({ role: 'tab', 'aria-selected': 'true' });
    expect(trigger.id).toBe(tabsIds('tabs-1', { value: 'alerts' }).trigger);
    expect(trigger['aria-controls']).toBe(tabsIds('tabs-1', { value: 'alerts' }).panel);
    expect(panel).toMatchObject({ role: 'tabpanel', id: tabsIds('tabs-1', { value: 'alerts' }).panel, tabIndex: 0 });
    expect(panel['aria-labelledby']).toBe(trigger.id);
  });

  it('never lets two values share an id', () => {
    expect(tabsIds('t', { value: 'a b' }).trigger).not.toBe(tabsIds('t', { value: 'a_b' }).trigger);
  });

  it('gives 1 and "1" different ids', () => {
    expect(tabsIds('t', { value: 1 }).trigger).not.toBe(tabsIds('t', { value: '1' }).trigger);
    expect(tabsIds('t', { value: 1 }).panel).not.toBe(tabsIds('t', { value: '1' }).panel);
  });

  it('selects, wires and stops on number values', () => {
    const zero = { value: 0 };
    const one = { value: 1 };
    const numbered = [zero, one, { value: 2, disabled: true }];
    const parts = getTabsProps({ id: 't', items: numbered, value: 1 }, vi.fn());
    expect(parts.trigger(one)).toMatchObject({ 'aria-selected': 'true', tabIndex: 0 });
    expect(parts.trigger(zero)).toMatchObject({ 'aria-selected': 'false', tabIndex: -1 });
    expect(parts.panel(one)['aria-labelledby']).toBe(parts.trigger(one).id);
    expect(resolveSelectedTab(numbered, undefined)).toBe(0);
    expect(resolveSelectedTab(numbered, 0)).toBe(0);
  });

  it('uses the item key instead of the value when the adapter gives one', () => {
    const item = { value: 2, key: 'gen-7' };
    expect(tabsIds('t', item)).toEqual({ trigger: 't-trigger-gen-7', panel: 't-panel-gen-7' });
  });

  it('lets an item id replace the trigger id, and the panel follows it', () => {
    const item = { value: 0, key: 'gen-7', id: 'custom' };
    const parts = getTabsProps({ id: 't', items: [item] }, vi.fn());
    expect(parts.trigger(item).id).toBe('custom');
    expect(parts.panel(item)['aria-labelledby']).toBe('custom');
    expect(parts.trigger(item)['aria-controls']).toBe('t-panel-gen-7');
    expect(parts.panel(item).id).toBe('t-panel-gen-7');
  });

  it('renders the same ids whatever the item order, with no registration needed', () => {
    const a = { value: 'a' };
    const b = { value: 'b' };
    const first = getTabsProps({ id: 't', items: [a, b] }, vi.fn());
    const second = getTabsProps({ id: 't', items: [] }, vi.fn());
    expect(second.panel(b)['aria-labelledby']).toBe(first.trigger(b).id);
    expect(second.trigger(b)['aria-controls']).toBe(first.panel(b).id);
  });

  it('renders aria-selected false on the other tabs', () => {
    const trigger = getTabsProps(base({ value: 'account' }), vi.fn()).trigger({ value: 'alerts' });
    expect(trigger['aria-selected']).toBe('false');
  });
});

describe('selection and the single tab stop', () => {
  it('selects the first enabled tab with no value', () => {
    const parts = getTabsProps(base(), vi.fn());
    expect(parts.trigger({ value: 'account' })['aria-selected']).toBe('true');
    expect(parts.trigger({ value: 'alerts' })['aria-selected']).toBe('false');
  });

  it('puts the tab stop on the selected tab and -1 elsewhere', () => {
    const parts = getTabsProps(base({ value: 'alerts' }), vi.fn());
    expect(parts.trigger({ value: 'alerts' }).tabIndex).toBe(0);
    expect(parts.trigger({ value: 'account' }).tabIndex).toBe(-1);
    expect(parts.trigger({ value: 'extra' }).tabIndex).toBe(-1);
  });

  it('moves the tab stop to the first enabled tab when the selected one is disabled, and keeps it selected', () => {
    const parts = getTabsProps(base({ value: 'password' }), vi.fn());
    expect(parts.trigger({ value: 'password', disabled: true })['aria-selected']).toBe('true');
    expect(parts.trigger({ value: 'password', disabled: true }).tabIndex).toBe(-1);
    expect(parts.trigger({ value: 'account' }).tabIndex).toBe(0);
  });

  it('hides every panel but the selected one with the native hidden attribute', () => {
    const parts = getTabsProps(base({ value: 'alerts' }), vi.fn());
    expect(parts.panel({ value: 'alerts' }).hidden).toBeUndefined();
    expect(parts.panel({ value: 'account' }).hidden).toBe(true);
  });
});

describe('panel content', () => {
  const content = (state: Partial<TabsState>, value: string, keep?: boolean): boolean =>
    getTabsProps(base(state), vi.fn()).hasContent({ value }, keep);

  it('renders the content of the selected panel only', () => {
    expect(content({ value: 'alerts' }, 'alerts')).toBe(true);
    expect(content({ value: 'alerts' }, 'account')).toBe(false);
  });

  it('follows the first enabled tab when no value is given', () => {
    expect(content({}, 'account')).toBe(true);
    expect(content({}, 'alerts')).toBe(false);
  });

  it('keeps every panel content with keepContent, or one panel with keep', () => {
    expect(content({ value: 'alerts', keepContent: true }, 'account')).toBe(true);
    expect(content({ value: 'alerts' }, 'account', true)).toBe(true);
    expect(content({ value: 'alerts', keepContent: true }, 'account', false)).toBe(false);
  });

  it('keeps a kept panel hidden while it is not selected', () => {
    const parts = getTabsProps(base({ value: 'alerts', keepContent: true }), vi.fn());
    expect(parts.panel({ value: 'account' }).hidden).toBe(true);
  });
});

describe('data attributes', () => {
  it('renders orientation on root, list, trigger and panel', () => {
    const parts = getTabsProps(base({ orientation: 'vertical' }), vi.fn());
    for (const part of [
      parts.root,
      parts.list,
      parts.trigger({ value: 'account' }),
      parts.panel({ value: 'account' }),
    ]) {
      expect(part['data-orientation']).toBe('vertical');
    }
    expect(getTabsProps(base(), vi.fn()).root['data-orientation']).toBe('horizontal');
  });

  it('renders selected, disabled and focus-visible as presence attributes', () => {
    const parts = getTabsProps(base({ value: 'account', focusVisibleValue: 'account' }), vi.fn());
    const selected = parts.trigger({ value: 'account' });
    expect(selected['data-selected']).toBe('');
    expect(selected['data-focus-visible']).toBe('');
    expect(selected['data-disabled']).toBeUndefined();
    const disabled = parts.trigger({ value: 'password', disabled: true });
    expect(disabled['data-disabled']).toBe('');
    expect(disabled['data-selected']).toBeUndefined();
    expect(disabled.disabled).toBe(true);
    expect(parts.panel({ value: 'account' })['data-selected']).toBe('');
    expect(parts.panel({ value: 'alerts' })['data-selected']).toBeUndefined();
  });

  it('renders exactly the attributes the meta declares', () => {
    const dataKeys = (props: object): string[] =>
      Object.entries(props)
        .filter(([name, value]) => name.startsWith('data-') && value !== undefined)
        .map(([name]) => name)
        .sort();
    const parts = getTabsProps(base({ value: 'password', focusVisibleValue: 'password' }), vi.fn());
    expect(dataKeys(parts.root)).toEqual([...tabsMeta.dataAttrs.root].sort());
    expect(dataKeys(parts.list)).toEqual([...tabsMeta.dataAttrs.list].sort());
    expect(dataKeys(parts.trigger({ value: 'password', disabled: true }))).toEqual(
      [...tabsMeta.dataAttrs.trigger].sort(),
    );
    expect(dataKeys(parts.panel({ value: 'password' }))).toEqual([...tabsMeta.dataAttrs.panel].sort());
    expect(dataKeys(parts.indicator)).toEqual([...tabsMeta.dataAttrs.indicator]);
  });

  it('marks the indicator decorative', () => {
    expect(getTabsProps(base(), vi.fn()).indicator['aria-hidden']).toBe('true');
  });
});

describe('click', () => {
  it('sends TRIGGER.CLICK with the value', () => {
    const send = vi.fn();
    const event = new Event('click', { cancelable: true });
    getTabsProps(base(), send).trigger({ value: 'alerts' }).onClick(event);
    expect(send).toHaveBeenCalledWith({ type: 'TRIGGER.CLICK', value: 'alerts', event });
  });

  it('sends nothing when a consumer handler vetoed the click', () => {
    const send = vi.fn();
    const event = new Event('click', { cancelable: true });
    event.preventDefault();
    getTabsProps(base(), send).trigger({ value: 'alerts' }).onClick(event);
    expect(send).not.toHaveBeenCalled();
  });
});

describe('transitionTabs', () => {
  const state = base({ value: 'account' });
  const event = new Event('click');

  it('selects another enabled tab on click', () => {
    expect(transitionTabs(state, { type: 'TRIGGER.CLICK', value: 'alerts', event })).toEqual({ select: 'alerts' });
  });

  it('does nothing for the selected tab or a disabled tab', () => {
    expect(transitionTabs(state, { type: 'TRIGGER.CLICK', value: 'account', event })).toEqual({});
    expect(transitionTabs(state, { type: 'TRIGGER.CLICK', value: 'password', event })).toEqual({});
  });

  it('does not report the implicitly selected first tab as a change', () => {
    expect(transitionTabs(base(), { type: 'TRIGGER.CLICK', value: 'account', event })).toEqual({});
  });

  it('moves focus only in manual mode, and focus plus selection in automatic mode', () => {
    const manual = { ...state, activationMode: 'manual' } as const;
    expect(transitionTabs(manual, { type: 'TRIGGER.NAVIGATE', value: 'alerts', event })).toEqual({ focus: 'alerts' });
    expect(transitionTabs(state, { type: 'TRIGGER.NAVIGATE', value: 'alerts', event })).toEqual({
      focus: 'alerts',
      select: 'alerts',
    });
  });

  it('does not select the tab it navigates to when it is already selected', () => {
    expect(transitionTabs(state, { type: 'TRIGGER.NAVIGATE', value: 'account', event })).toEqual({ focus: 'account' });
  });
});

describe('keyboard', () => {
  it('leaves key handling to the adapter roving focus: the trigger has no key handler', () => {
    expect(getTabsProps(base(), vi.fn()).trigger({ value: 'account' })).not.toHaveProperty('onKeyDown');
  });

  it('keeps Enter and Space native: they click the button', () => {
    expect(tabsKeymap.flatMap((binding) => binding.keys)).not.toEqual(expect.arrayContaining(['Enter']));
    expect(tabsKeymap.flatMap((binding) => binding.keys)).not.toEqual(expect.arrayContaining([' ']));
  });
});

describe('meta', () => {
  it('links the APG pattern, the roles and the default elements', () => {
    expect(tabsMeta.apg).toBe('https://www.w3.org/WAI/ARIA/apg/patterns/tabs/');
    expect(tabsMeta.roles).toMatchObject({ list: 'tablist', trigger: 'tab', panel: 'tabpanel' });
    expect(tabsMeta.defaultElements).toMatchObject({ root: 'div', list: 'div', trigger: 'button', panel: 'div' });
  });

  it('agrees with the keymap in both directions', () => {
    const metaKeys = tabsMeta.keyboard.map((row) => row.key);
    for (const binding of tabsKeymap) expect(metaKeys).toContain(binding.row);
    const handled = new Set(tabsKeymap.map((binding) => binding.row));
    for (const row of tabsMeta.keyboard) {
      if (!handled.has(row.key)) expect(row.action).toMatch(/^Native/);
    }
  });
});
