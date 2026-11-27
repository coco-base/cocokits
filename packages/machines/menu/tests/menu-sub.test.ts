import { describe, expect, it, vi } from 'vitest';
import {
  MENU_SUB_OPEN_DELAY_MS,
  createMenuContentKeyDown,
  createMenuSubTriggerKeyDown,
  getMenuProps,
  getMenuSubPlacement,
  menuKeymap,
  menuMeta,
  menuSubIds,
  transitionMenu,
  transitionMenuSub,
  type MenuEvent,
  type MenuItemEntry,
  type MenuState,
  type MenuSubState,
} from '../index';
import { base, dataKeys, event, key, keyInContent, opened } from './fixtures';

const share: MenuItemEntry = { key: 'share', text: 'Share' };
const parent = (over: Partial<MenuState> = {}): MenuState =>
  opened({ items: [{ key: 'edit', text: 'Edit' }, share], activeKey: 'share', ...over });
const sub = (over: Partial<MenuSubState> = {}): MenuSubState => ({ id: 's1', open: false, ...over });

function pressOnSubTrigger(
  state: MenuState,
  entry: MenuItemEntry,
  keyName: string,
  init: Parameters<typeof key>[1] = {},
) {
  const send = vi.fn<(sent: MenuEvent) => void>();
  const pressed = key(keyName, init);
  createMenuSubTriggerKeyDown(state, entry, send)(pressed);
  return { send, event: pressed, sent: send.mock.calls[0]?.[0] };
}

describe('sub-trigger props (menu-07)', () => {
  it('is a menuitem that has a menu popup, with the open state always rendered', () => {
    const closed = getMenuProps(parent(), vi.fn()).subTrigger(share, sub());
    expect(closed).toMatchObject({
      class: 'cck-menu__sub-trigger',
      id: 's1-trigger',
      role: 'menuitem',
      'aria-haspopup': 'menu',
      'aria-expanded': 'false',
      'data-state': 'closed',
    });
    expect(closed['aria-controls']).toBeUndefined();
    const open = getMenuProps(parent(), vi.fn()).subTrigger(share, sub({ open: true }));
    expect(open).toMatchObject({ 'aria-expanded': 'true', 'data-state': 'open', 'aria-controls': 's1-content' });
  });

  it('keeps aria-controls while the closed sub-content still exits', () => {
    const props = getMenuProps(parent(), vi.fn()).subTrigger(share, sub({ mounted: true }));
    expect(props['aria-controls']).toBe('s1-content');
    expect(props['aria-expanded']).toBe('false');
  });

  it('uses the author trigger id', () => {
    expect(getMenuProps(parent(), vi.fn()).subTrigger(share, sub({ triggerId: 'mine' })).id).toBe('mine');
    expect(menuSubIds('s1', 'mine')).toEqual({ trigger: 'mine', content: 's1-content' });
    expect(menuSubIds('s1')).toEqual({ trigger: 's1-trigger', content: 's1-content' });
  });

  it('is part of the roving tab stop and highlighted while it is the active item of an open menu', () => {
    const active = getMenuProps(parent(), vi.fn()).subTrigger(share, sub());
    expect(active).toMatchObject({ tabIndex: 0, 'data-highlighted': '' });
    const other = getMenuProps(parent({ activeKey: 'edit' }), vi.fn()).subTrigger(share, sub());
    expect(other).toMatchObject({ tabIndex: -1 });
    expect(other['data-highlighted']).toBeUndefined();
    const shut = getMenuProps(parent({ open: false }), vi.fn()).subTrigger(share, sub());
    expect(shut['data-highlighted']).toBeUndefined();
  });

  it('marks a disabled sub-trigger without removing it from the tab order', () => {
    const props = getMenuProps(parent(), vi.fn()).subTrigger({ ...share, disabled: true }, sub());
    expect(props).toMatchObject({ 'aria-disabled': 'true', 'data-disabled': '', tabIndex: 0 });
    expect(getMenuProps(parent(), vi.fn()).subTrigger(share, sub())['aria-disabled']).toBeUndefined();
  });

  it('renders exactly the data attributes of the meta', () => {
    const props = getMenuProps(parent(), vi.fn()).subTrigger({ ...share, disabled: true }, sub());
    expect(dataKeys(props)).toEqual([...menuMeta.dataAttrs.subTrigger].sort());
  });

  it('sends the click and the pointer move as submenu events, and the focus as a parent event', () => {
    const send = vi.fn<(sent: MenuEvent) => void>();
    const props = getMenuProps(parent(), send).subTrigger(share, sub());
    props.onClick(event);
    props.onPointerMove(event);
    props.onFocus(event);
    expect(send.mock.calls.map(([sent]) => sent)).toEqual([
      { type: 'SUB.TRIGGER.CLICK', event },
      { type: 'SUB.TRIGGER.POINTER_MOVE', event },
      { type: 'ITEM.FOCUS', key: 'share' },
    ]);
  });

  it('sends nothing for a vetoed click', () => {
    const send = vi.fn();
    const vetoed = Object.assign(new Event('click', { cancelable: true }), {});
    vetoed.preventDefault();
    getMenuProps(parent(), send).subTrigger(share, sub()).onClick(vetoed);
    expect(send).not.toHaveBeenCalled();
  });
});

describe('sub-content props (menu-07)', () => {
  it('is a menu named by the sub-trigger, with the sub-content class and the placement', () => {
    const { content } = getMenuProps(
      base({ id: 's1', open: true, sub: true, triggerId: 'sub-trigger-id', side: 'start', align: 'end' }),
      vi.fn(),
    );
    expect(content).toMatchObject({
      class: 'cck-menu__sub-content',
      role: 'menu',
      id: 's1-content',
      'aria-labelledby': 'sub-trigger-id',
      'data-state': 'open',
      'data-side': 'start',
      'data-align': 'end',
    });
    expect(dataKeys(content)).toEqual([...menuMeta.dataAttrs.subContent].sort());
  });

  it('keeps the content class for a menu that is not a submenu', () => {
    expect(getMenuProps(base({ open: true }), vi.fn()).content.class).toBe('cck-menu__content');
  });
});

describe('submenu transitions (menu-07)', () => {
  const run = (state: Parameters<typeof transitionMenuSub>[0], sent: MenuEvent) => transitionMenuSub(state, sent);
  const closed = { open: false };
  const open = { open: true };

  it.each([
    ['a click', { type: 'SUB.TRIGGER.CLICK', event }, { open: true, reason: 'trigger' }],
    ['a key', { type: 'SUB.TRIGGER.OPEN', initial: 'first', event }, { open: true, reason: 'key', initial: 'first' }],
    [
      'the pointer resting on it',
      { type: 'SUB.TRIGGER.POINTER_MOVE', event },
      { open: true, reason: 'pointer', delay: MENU_SUB_OPEN_DELAY_MS },
    ],
  ] as const)('opens by %s', (_name, sent, expected) => {
    expect(run(closed, sent)).toEqual(expected);
  });

  it.each([
    ['a click', { type: 'SUB.TRIGGER.CLICK', event }],
    ['a key', { type: 'SUB.TRIGGER.OPEN', initial: 'first', event }],
    ['the pointer', { type: 'SUB.TRIGGER.POINTER_MOVE', event }],
  ] as const)('does nothing for %s while it is open or the sub-trigger is disabled', (_name, sent) => {
    expect(run(open, sent)).toBeNull();
    expect(run({ ...closed, disabled: true }, sent)).toBeNull();
  });

  it.each([
    [
      'the pointer moving to another item',
      { type: 'SUB.PARENT.POINTER_MOVE', event },
      { open: false, reason: 'pointer' },
    ],
    ['ArrowLeft in it', { type: 'SUB.CLOSE', event }, { open: false, reason: 'key', focus: 'trigger' }],
    ['Escape', { type: 'SUB.DISMISS', reason: 'escape', event }, { open: false, reason: 'escape', focus: 'trigger' }],
    [
      'an outside press',
      { type: 'SUB.DISMISS', reason: 'outside-press', event },
      { open: false, reason: 'outside-press' },
    ],
  ] as const)('closes by %s', (_name, sent, expected) => {
    expect(run(open, sent)).toEqual(expected);
    expect(run(closed, sent)).toBeNull();
  });

  it('returns focus to the sub-trigger only after a key or Escape, not after the pointer or an outside press', () => {
    const focused = [
      { type: 'SUB.CLOSE', event },
      { type: 'SUB.DISMISS', reason: 'escape', event },
    ] as const;
    for (const sent of focused) expect(run(open, sent)?.focus).toBe('trigger');
    const kept = [
      { type: 'SUB.PARENT.POINTER_MOVE', event },
      { type: 'SUB.DISMISS', reason: 'outside-press', event },
    ] as const;
    for (const sent of kept) expect(run(open, sent)?.focus).toBeUndefined();
  });

  it('ignores the events that are not about a submenu, and the submenu events leave the menu alone', () => {
    expect(run(open, { type: 'ITEM.FOCUS', key: 'x' })).toBeNull();
    expect(run(open, { type: 'TRIGGER.CLICK', event })).toBeNull();
    for (const sent of [
      { type: 'SUB.TRIGGER.CLICK', event },
      { type: 'SUB.CLOSE', event },
      { type: 'SUB.PARENT.POINTER_MOVE', event },
    ] as const) {
      expect(transitionMenu(opened(), sent)).toBeNull();
    }
  });

  it('closes the whole menu when an item of the submenu runs', () => {
    expect(transitionMenu(opened(), { type: 'ITEM.RUN', key: 'deep', disabled: false, event })).toEqual({
      open: false,
      reason: 'item',
    });
  });
});

describe('submenu keys (menu-07)', () => {
  it.each([
    ['ArrowRight', 'ltr', 'ArrowRight', true],
    ['ArrowLeft', 'ltr', 'ArrowLeft', false],
    ['Enter', 'ltr', 'Enter', true],
    ['Space', 'ltr', ' ', true],
    ['ArrowLeft in rtl', 'rtl', 'ArrowLeft', true],
    ['ArrowRight in rtl', 'rtl', 'ArrowRight', false],
    ['Enter in rtl', 'rtl', 'Enter', true],
    ['ArrowDown', 'ltr', 'ArrowDown', false],
    ['a letter', 'ltr', 'a', false],
  ] as const)('on the sub-trigger, %s opens: %s', (_name, dir, keyName, opens) => {
    const { sent, event: pressed } = pressOnSubTrigger(parent({ dir }), share, keyName);
    if (opens) {
      expect(sent).toMatchObject({ type: 'SUB.TRIGGER.OPEN', initial: 'first' });
      expect(pressed.defaultPrevented).toBe(true);
    } else {
      expect(sent).toBeUndefined();
      expect(pressed.defaultPrevented).toBe(false);
    }
  });

  it('holds the default action of a disabled sub-trigger and opens nothing', () => {
    const { send, event: pressed } = pressOnSubTrigger(parent(), { ...share, disabled: true }, 'Enter');
    expect(send).not.toHaveBeenCalled();
    expect(pressed.defaultPrevented).toBe(true);
  });

  it.each([
    ['Ctrl', { ctrlKey: true }],
    ['Alt', { altKey: true }],
    ['Meta', { metaKey: true }],
    ['Shift', { shiftKey: true }],
    ['a composition', { isComposing: true }],
    ['a veto', { defaultPrevented: true }],
  ])('ignores ArrowRight with %s', (_name, init) => {
    expect(pressOnSubTrigger(parent(), share, 'ArrowRight', init).send).not.toHaveBeenCalled();
  });

  it('leaves Space to a running typeahead search', () => {
    const typeahead = { match: () => null, reset: vi.fn(), isActive: () => true };
    expect(pressOnSubTrigger(parent({ typeahead }), share, ' ').send).not.toHaveBeenCalled();
  });

  it.each([
    ['ltr', 'ArrowLeft'],
    ['rtl', 'ArrowRight'],
  ] as const)('in a submenu (%s), %s closes it and prevents the default', (dir, keyName) => {
    const { sent, event: pressed } = keyInContent(parent({ sub: true, dir }), keyName);
    expect(sent).toMatchObject({ type: 'SUB.CLOSE' });
    expect(pressed.defaultPrevented).toBe(true);
  });

  it.each([
    ['ltr', 'ArrowRight'],
    ['rtl', 'ArrowLeft'],
  ] as const)('in a submenu (%s), %s does nothing', (dir, keyName) => {
    expect(keyInContent(parent({ sub: true, dir }), keyName).send).not.toHaveBeenCalled();
  });

  it('in a menu that is not a submenu, ArrowLeft does nothing', () => {
    expect(keyInContent(parent(), 'ArrowLeft').send).not.toHaveBeenCalled();
  });

  it('keeps moving between the items of a submenu with ArrowDown', () => {
    expect(keyInContent(parent({ sub: true, activeKey: 'edit' }), 'ArrowDown').sent).toMatchObject({
      type: 'CONTENT.MOVE',
      key: 'share',
    });
  });

  it('ignores ArrowLeft in a submenu with Shift, Ctrl or a composition', () => {
    for (const init of [{ shiftKey: true }, { ctrlKey: true }, { isComposing: true }]) {
      expect(keyInContent(parent({ sub: true }), 'ArrowLeft', init).send).not.toHaveBeenCalled();
    }
  });

  it('wires the sub-trigger key handler and the content handler', () => {
    const send = vi.fn<(sent: MenuEvent) => void>();
    getMenuProps(parent(), send).subTrigger(share, sub()).onKeyDown(key('ArrowRight'));
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ type: 'SUB.TRIGGER.OPEN' }));
    const sentInSub = vi.fn<(sent: MenuEvent) => void>();
    createMenuContentKeyDown(parent({ sub: true }), sentInSub)(key('ArrowLeft'));
    expect(sentInSub).toHaveBeenCalledWith(expect.objectContaining({ type: 'SUB.CLOSE' }));
  });

  it('has a keymap row and a meta row for each submenu key', () => {
    const contexts = ['Sub-trigger', 'Submenu'];
    const bound = menuKeymap.filter((binding) => contexts.includes(binding.context));
    const rows = menuMeta.keyboard.filter((row) => contexts.includes(row.context));
    expect(bound.map((binding) => `${binding.row} | ${binding.context}`).sort()).toEqual(
      rows.map((row) => `${row.key} | ${row.context}`).sort(),
    );
  });
});

describe('submenu placement (menu-07)', () => {
  it('puts the top-start corner of the content at the bottom-end corner of the sub-trigger', () => {
    expect(getMenuSubPlacement(180)).toEqual({
      side: 'bottom',
      align: 'start',
      alignOffset: 180,
      fallbackSides: ['start', 'top'],
    });
  });

  it('moves the content by the width of the sub-trigger, whatever it is', () => {
    expect(getMenuSubPlacement(0).alignOffset).toBe(0);
    expect(getMenuSubPlacement(96.5).alignOffset).toBe(96.5);
  });
});
