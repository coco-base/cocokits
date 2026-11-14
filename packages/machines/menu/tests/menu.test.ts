import { describe, expect, it, vi } from 'vitest';
import { getMenuProps, menuAnatomy, menuIds, menuMeta, transitionMenu, type MenuEvent } from '../index';
import { base, dataKeys, duplicate, edit, event, move, opened } from './fixtures';

describe('classes', () => {
  it('renders the part classes', () => {
    const parts = getMenuProps(opened(), vi.fn());
    expect(menuAnatomy.classes).toMatchObject({
      root: 'cck-menu',
      trigger: 'cck-menu__trigger',
      content: 'cck-menu__content',
      item: 'cck-menu__item',
    });
    expect(parts.trigger.class).toBe('cck-menu__trigger');
    expect(parts.content.class).toBe('cck-menu__content');
    expect(parts.item(edit).class).toBe('cck-menu__item');
  });
});

describe('trigger', () => {
  it('is a menu button with the open state and the content id while mounted', () => {
    const closed = getMenuProps(base(), vi.fn()).trigger;
    expect(closed).toMatchObject({
      id: 'm1-trigger',
      type: 'button',
      'aria-haspopup': 'menu',
      'aria-expanded': 'false',
      'aria-controls': undefined,
      'data-state': 'closed',
    });
    const open = getMenuProps(opened(), vi.fn()).trigger;
    expect(open).toMatchObject({ 'aria-expanded': 'true', 'aria-controls': 'm1-content', 'data-state': 'open' });
  });

  it('keeps aria-controls while the closed content still exits, and drops it when not mounted', () => {
    expect(getMenuProps(base({ mounted: true }), vi.fn()).trigger['aria-controls']).toBe('m1-content');
    expect(getMenuProps(opened({ mounted: false }), vi.fn()).trigger['aria-controls']).toBeUndefined();
  });

  it('sends TRIGGER.CLICK unless the click was vetoed', () => {
    const send = vi.fn();
    const { trigger } = getMenuProps(base(), send);
    trigger.onClick(event);
    expect(send).toHaveBeenCalledWith({ type: 'TRIGGER.CLICK', event });
    send.mockClear();
    const vetoed = new Event('click', { cancelable: true });
    vetoed.preventDefault();
    trigger.onClick(vetoed);
    expect(send).not.toHaveBeenCalled();
  });
});

describe('content', () => {
  it('is a menu named by the trigger, never a tab stop', () => {
    expect(getMenuProps(opened(), vi.fn()).content).toMatchObject({
      id: 'm1-content',
      role: 'menu',
      tabIndex: -1,
      'aria-labelledby': 'm1-trigger',
      'data-state': 'open',
      'data-side': 'bottom',
      'data-align': 'start',
    });
  });

  it('leaves the name to the author, and renders the resolved placement', () => {
    const content = getMenuProps(opened({ named: true, side: 'top', align: 'end' }), vi.fn()).content;
    expect(content['aria-labelledby']).toBeUndefined();
    expect(content).toMatchObject({ 'data-side': 'top', 'data-align': 'end' });
  });

  it('stays closed in data-state while it exits', () => {
    expect(getMenuProps(base({ mounted: true }), vi.fn()).content['data-state']).toBe('closed');
  });
});

describe('items', () => {
  it('are menuitems; only the active one is a tab stop', () => {
    const { item } = getMenuProps(opened({ activeKey: 'duplicate' }), vi.fn());
    expect(item(edit)).toMatchObject({ role: 'menuitem', tabIndex: -1 });
    expect(item(duplicate)).toMatchObject({ role: 'menuitem', tabIndex: 0 });
  });

  it('make the first item the tab stop when there is no active item or it was removed', () => {
    for (const activeKey of [undefined, 'gone']) {
      const { item } = getMenuProps(opened({ activeKey }), vi.fn());
      expect([edit, duplicate, move].map((entry) => item(entry).tabIndex)).toEqual([0, -1, -1]);
    }
  });

  it('mark a disabled item with aria-disabled and data-disabled', () => {
    const { item } = getMenuProps(opened(), vi.fn());
    expect(item(move)).toMatchObject({ 'aria-disabled': 'true', 'data-disabled': '' });
    expect(item(edit)['aria-disabled']).toBeUndefined();
    expect(item(edit)['data-disabled']).toBeUndefined();
  });

  it('send ITEM.RUN on click unless vetoed, and ITEM.FOCUS on focus', () => {
    const send = vi.fn();
    const { item } = getMenuProps(opened(), send);
    item(move).onClick(event);
    expect(send).toHaveBeenCalledWith({ type: 'ITEM.RUN', key: 'move', disabled: true, event });
    item(edit).onFocus(event);
    expect(send).toHaveBeenCalledWith({ type: 'ITEM.FOCUS', key: 'edit' });
    send.mockClear();
    const vetoed = new Event('click', { cancelable: true });
    vetoed.preventDefault();
    item(edit).onClick(vetoed);
    expect(send).not.toHaveBeenCalled();
  });
});

describe('meta', () => {
  it('lists every data-* the props emit', () => {
    const parts = getMenuProps(opened(), vi.fn());
    const emitted = { trigger: parts.trigger, content: parts.content, item: parts.item(move) };
    for (const [part, props] of Object.entries(emitted)) {
      for (const name of dataKeys(props)) {
        expect(menuMeta.dataAttrs[part as keyof typeof menuMeta.dataAttrs]).toContain(name);
      }
    }
    expect(dataKeys(parts.content)).toEqual(['data-align', 'data-side', 'data-state']);
  });

  it('names the roles and the pattern', () => {
    expect(menuMeta.roles).toEqual({ root: null, trigger: null, content: 'menu', item: 'menuitem' });
    expect(menuMeta.apg).toContain('menu-button');
  });

  it('derives the ids from the menu id', () => {
    expect(menuIds('m1')).toEqual({ trigger: 'm1-trigger', content: 'm1-content' });
  });
});

describe('transitionMenu', () => {
  const send = (state: Parameters<typeof transitionMenu>[0], sent: MenuEvent) => transitionMenu(state, sent);

  it('toggles on a trigger click and opens on the first item', () => {
    expect(send(base(), { type: 'TRIGGER.CLICK', event })).toEqual({ open: true, reason: 'trigger', initial: 'first' });
    expect(send(opened(), { type: 'TRIGGER.CLICK', event })).toEqual({ open: false, reason: 'trigger' });
  });

  it('opens on the first or last item for the trigger keys, and does nothing while open', () => {
    expect(send(base(), { type: 'TRIGGER.OPEN', initial: 'first', event })).toEqual({
      open: true,
      reason: 'trigger',
      initial: 'first',
    });
    expect(send(base(), { type: 'TRIGGER.OPEN', initial: 'last', event })).toMatchObject({ initial: 'last' });
    expect(send(opened(), { type: 'TRIGGER.OPEN', initial: 'last', event })).toBeNull();
  });

  it('closes with reason item when an enabled item runs', () => {
    expect(send(opened(), { type: 'ITEM.RUN', key: 'edit', disabled: false, event })).toEqual({
      open: false,
      reason: 'item',
    });
  });

  it('keeps the menu open when the item event was prevented', () => {
    expect(send(opened(), { type: 'ITEM.RUN', key: 'edit', disabled: false, prevented: true, event })).toBeNull();
  });

  it('changes nothing for a disabled item', () => {
    expect(send(opened(), { type: 'ITEM.RUN', key: 'move', disabled: true, event })).toBeNull();
  });

  it('closes for each dismiss reason', () => {
    for (const reason of ['escape', 'outside-press', 'focus-out'] as const) {
      expect(send(opened(), { type: 'CONTENT.DISMISS', reason, event: null })).toEqual({ open: false, reason });
    }
  });

  it('changes nothing for focus, move and press events', () => {
    for (const sent of [
      { type: 'ITEM.FOCUS', key: 'edit' },
      { type: 'ITEM.PRESS', key: 'edit', event },
      { type: 'CONTENT.MOVE', key: 'edit', event },
    ] as const) {
      expect(send(opened(), sent)).toBeNull();
    }
  });

  it('changes nothing while closed, except the trigger events', () => {
    for (const sent of [
      { type: 'CONTENT.DISMISS', reason: 'escape', event: null },
      { type: 'ITEM.RUN', key: 'edit', disabled: false, event },
      { type: 'ITEM.FOCUS', key: 'edit' },
    ] as const) {
      expect(send(base(), sent)).toBeNull();
    }
  });
});
