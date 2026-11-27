import { describe, expect, it, vi } from 'vitest';
import {
  getTabNavProps,
  resolveTabNavStop,
  tabNavAnatomy,
  tabNavLinkId,
  tabNavMeta,
  tabNavPanelModeRoles,
} from '../index';

const click = (): Event & { stopImmediatePropagation: () => void } => new Event('click', { cancelable: true });

describe('classes', () => {
  it('renders the part classes', () => {
    const parts = getTabNavProps();
    expect(tabNavAnatomy.classes).toMatchObject({
      root: 'cck-tab-nav',
      list: 'cck-tab-nav__list',
      link: 'cck-tab-nav__link',
      indicator: 'cck-tab-nav__indicator',
      panel: 'cck-tab-nav__panel',
    });
    expect(parts.root.class).toBe('cck-tab-nav');
    expect(parts.list.class).toBe('cck-tab-nav__list');
    expect(parts.link({}).class).toBe('cck-tab-nav__link');
    expect(parts.indicator.class).toBe('cck-tab-nav__indicator');
    expect(parts.panel({ id: 'p' }).class).toBe('cck-tab-nav__panel');
  });

  it('keeps links as links: no tablist, tab or tabpanel role anywhere', () => {
    const parts = getTabNavProps();
    expect(JSON.stringify(parts.link({ active: true }))).not.toContain('role');
    expect(parts.list).not.toHaveProperty('role');
    expect(tabNavMeta.roles).toEqual({ root: null, list: null, link: null, indicator: null, panel: 'tabpanel' });
  });
});

describe('link state', () => {
  it('marks the active link with aria-current page and data-active', () => {
    const active = getTabNavProps().link({ active: true });
    expect(active['aria-current']).toBe('page');
    expect(active['data-active']).toBe('');
    const other = getTabNavProps().link({});
    expect(other['aria-current']).toBeUndefined();
    expect(other['data-active']).toBeUndefined();
  });

  it('marks a disabled link with aria-disabled, data-disabled and no tab stop', () => {
    const disabled = getTabNavProps().link({ disabled: true });
    expect(disabled).toMatchObject({ 'aria-disabled': 'true', 'data-disabled': '', tabIndex: -1 });
    const enabled = getTabNavProps().link({});
    expect(enabled['aria-disabled']).toBeUndefined();
    expect(enabled).not.toHaveProperty('tabIndex', -1);
  });

  it('renders exactly the attributes the meta declares', () => {
    const dataKeys = (props: object): string[] =>
      Object.entries(props)
        .filter(([name, value]) => name.startsWith('data-') && value !== undefined)
        .map(([name]) => name)
        .sort();
    expect(dataKeys(getTabNavProps().link({ active: true, disabled: true }))).toEqual(
      [...tabNavMeta.dataAttrs.link].sort(),
    );
    expect(dataKeys(getTabNavProps().root)).toEqual([...tabNavMeta.dataAttrs.root]);
  });

  it('marks the indicator decorative', () => {
    expect(getTabNavProps().indicator['aria-hidden']).toBe('true');
  });
});

describe('activation', () => {
  it('prevents the navigation of a disabled link and stops other listeners', () => {
    const event = click();
    const stop = vi.spyOn(event, 'stopImmediatePropagation');
    getTabNavProps().link({ disabled: true }).onClick?.(event);
    expect(event.defaultPrevented).toBe(true);
    expect(stop).toHaveBeenCalledTimes(1);
  });

  it('leaves the click of an enabled link alone', () => {
    expect(getTabNavProps().link({}).onClick).toBeUndefined();
    expect(getTabNavProps().link({ active: true }).onClick).toBeUndefined();
  });

  it('does nothing more when a consumer handler already vetoed the click', () => {
    const event = click();
    event.preventDefault();
    const stop = vi.spyOn(event, 'stopImmediatePropagation');
    getTabNavProps().link({ disabled: true }).onClick?.(event);
    expect(stop).not.toHaveBeenCalled();
  });
});

describe('meta', () => {
  it('has no APG pattern and declares the default elements', () => {
    expect(tabNavMeta.apg).toBeUndefined();
    expect(tabNavMeta.defaultElements).toEqual({
      root: 'nav',
      list: 'div',
      link: 'a',
      indicator: 'span',
      panel: 'div',
    });
  });

  it('lists the link rows as native and the panel-mode rows', () => {
    expect(tabNavMeta.keyboard.map((row) => row.key)).toEqual([
      'Tab / Shift+Tab',
      'Enter',
      'Tab (panel mode)',
      'ArrowRight / ArrowLeft',
      'Home / End',
      'Space',
    ]);
    for (const row of tabNavMeta.keyboard.slice(0, 3)) expect(row.action).toMatch(/^Native/);
  });
});

describe('panel mode', () => {
  const parts = getTabNavProps({ panelId: 'p' });

  it('makes the list a tablist and the links tabs, with the roles the meta names', () => {
    expect(parts.list.role).toBe(tabNavPanelModeRoles.list);
    expect(parts.link({}).role).toBe(tabNavPanelModeRoles.link);
    expect(parts.panel({ id: 'p' }).role).toBe(tabNavMeta.roles.panel);
    expect(parts.root).toEqual({ class: 'cck-tab-nav' });
  });

  it('gives each link aria-selected and aria-controls and never aria-current', () => {
    const active = parts.link({ active: true });
    const other = parts.link({});
    expect(active).toMatchObject({ 'aria-selected': 'true', 'aria-controls': 'p', 'data-active': '' });
    expect(other).toMatchObject({ 'aria-selected': 'false', 'aria-controls': 'p' });
    expect(active['aria-current']).toBeUndefined();
  });

  it('puts the one tab stop on the link that claims it and -1 on the others and on a disabled one', () => {
    expect(parts.link({ tabStop: true }).tabIndex).toBe(0);
    expect(parts.link({}).tabIndex).toBe(-1);
    expect(parts.link({ tabStop: true, disabled: true })).toMatchObject({ tabIndex: -1, 'aria-disabled': 'true' });
  });

  it('gives the active link the id the panel points at, unless the author set one', () => {
    expect(parts.link({ active: true }).id).toBe(tabNavLinkId('p'));
    expect(parts.link({}).id).toBeUndefined();
    expect(parts.link({ active: true, id: 'mine' }).id).toBe('mine');
    expect(parts.link({ id: 'other' }).id).toBe('other');
  });

  it('keeps the click guard on a disabled link', () => {
    expect(parts.link({ disabled: true }).onClick).toBeTypeOf('function');
    expect(parts.link({}).onClick).toBeUndefined();
  });

  it('renders the same list, link and panel on every call (pure)', () => {
    expect(getTabNavProps({ panelId: 'p' }).link({ active: true })).toEqual(parts.link({ active: true }));
  });

  it('keeps link mode when the state has no panel id', () => {
    const link = getTabNavProps({}).link({ active: true });
    expect(link).toMatchObject({ 'aria-current': 'page' });
    expect(link).not.toHaveProperty('role');
    expect(link).not.toHaveProperty('aria-controls');
  });
});

describe('panel', () => {
  const panel = getTabNavProps({ panelId: 'p' }).panel;

  it('is a tabpanel with tabindex 0, labelled by the derived active link id', () => {
    expect(panel({ id: 'p' })).toMatchObject({ id: 'p', role: 'tabpanel', tabIndex: 0, 'aria-labelledby': 'p-tab' });
  });

  it('is labelled by the active link id the adapter knows', () => {
    expect(panel({ id: 'p', activeLinkId: 'link-3' })['aria-labelledby']).toBe('link-3');
  });

  it('renders no aria-labelledby while no link is active', () => {
    expect(panel({ id: 'p', hasActiveLink: false })['aria-labelledby']).toBeUndefined();
    expect(panel({ id: 'p', hasActiveLink: false, activeLinkId: 'x' })['aria-labelledby']).toBeUndefined();
    expect(panel({ id: 'p', hasActiveLink: true })['aria-labelledby']).toBe('p-tab');
  });
});

describe('resolveTabNavStop', () => {
  it('is the active link', () => {
    expect(resolveTabNavStop([{}, { active: true }, {}])).toBe(1);
  });

  it('is the first enabled link when no link is active, also when the first link is disabled', () => {
    expect(resolveTabNavStop([{}, {}])).toBe(0);
    expect(resolveTabNavStop([{ disabled: true }, {}, {}])).toBe(1);
  });

  it('falls back to the first enabled link when the active link is disabled', () => {
    expect(resolveTabNavStop([{}, { active: true, disabled: true }])).toBe(0);
  });

  it('is -1 with no links or only disabled links', () => {
    expect(resolveTabNavStop([])).toBe(-1);
    expect(resolveTabNavStop([{ disabled: true }])).toBe(-1);
  });

  it('moves with the state: none, active, other, none', () => {
    const links = (active: number | null) => [0, 1, 2].map((i) => ({ active: i === active }));
    expect([null, 2, 0, null].map((active) => resolveTabNavStop(links(active)))).toEqual([0, 2, 0, 0]);
  });
});
