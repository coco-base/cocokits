import { describe, expect, it, vi } from 'vitest';
import { createTypeahead } from '@cocokits/cdk/roving-focus';
import { menuKeymap, menuMeta, type MenuItemEntry } from '../index';
import { base, duplicate, edit, fakeTypeahead, keyInContent, keyOnItem, keyOnTrigger, move, opened } from './fixtures';

describe('keymap and meta', () => {
  it('has one meta keyboard row for every binding row, and a binding for every meta row', () => {
    const rows = menuMeta.keyboard.map((row) => `${row.key} | ${row.context}`);
    const bound = new Set(menuKeymap.map((binding) => `${binding.row} | ${binding.context}`));
    expect([...bound].sort()).toEqual([...rows].sort());
    expect(menuMeta.keyboard).toHaveLength(10);
  });
});

describe('trigger keys', () => {
  it('opens on the first item with ArrowDown and on the last with ArrowUp', () => {
    const down = keyOnTrigger(base(), 'ArrowDown');
    expect(down.sent).toMatchObject({ type: 'TRIGGER.OPEN', initial: 'first' });
    expect(down.event.defaultPrevented).toBe(true);
    expect(keyOnTrigger(base(), 'ArrowUp').sent).toMatchObject({ type: 'TRIGGER.OPEN', initial: 'last' });
  });

  it('leaves Enter and Space to the native click', () => {
    for (const name of ['Enter', ' ']) {
      const result = keyOnTrigger(base(), name);
      expect(result.send).not.toHaveBeenCalled();
      expect(result.event.defaultPrevented).toBe(false);
    }
  });

  it('ignores the arrows while open, and modified, composing or prevented keys', () => {
    expect(keyOnTrigger(opened(), 'ArrowDown').send).not.toHaveBeenCalled();
    for (const init of [
      { ctrlKey: true },
      { altKey: true },
      { metaKey: true },
      { shiftKey: true },
      { isComposing: true },
      { defaultPrevented: true },
    ]) {
      const result = keyOnTrigger(base(), 'ArrowDown', init);
      expect(result.send).not.toHaveBeenCalled();
    }
  });
});

describe('moving', () => {
  const moveFrom = (activeKey: string | undefined, keyName: string) =>
    keyInContent(opened({ activeKey }), keyName).sent;

  it('moves to the next and previous item, disabled ones included', () => {
    expect(moveFrom('edit', 'ArrowDown')).toMatchObject({ type: 'CONTENT.MOVE', key: 'duplicate' });
    expect(moveFrom('duplicate', 'ArrowDown')).toMatchObject({ key: 'move' });
    expect(moveFrom('delete', 'ArrowUp')).toMatchObject({ key: 'move' });
  });

  it('wraps at both ends', () => {
    expect(moveFrom('delete', 'ArrowDown')).toMatchObject({ key: 'edit' });
    expect(moveFrom('edit', 'ArrowUp')).toMatchObject({ key: 'delete' });
  });

  it('goes to the first and last item with Home and End, even when disabled', () => {
    expect(moveFrom('duplicate', 'Home')).toMatchObject({ key: 'edit' });
    expect(moveFrom('duplicate', 'End')).toMatchObject({ key: 'delete' });
    const disabledEdges: MenuItemEntry[] = [
      { key: 'a', text: 'A', disabled: true },
      { key: 'b', text: 'B' },
      { key: 'c', text: 'C', disabled: true },
    ];
    expect(keyInContent(opened({ items: disabledEdges, activeKey: 'b' }), 'Home').sent).toMatchObject({ key: 'a' });
    expect(keyInContent(opened({ items: disabledEdges, activeKey: 'b' }), 'End').sent).toMatchObject({ key: 'c' });
  });

  it('does not flip the vertical keys in rtl: they are the same keys', () => {
    expect(moveFrom('edit', 'ArrowDown')).toMatchObject({ key: 'duplicate' });
    expect(moveFrom('edit', 'ArrowRight')).toBeUndefined();
    expect(moveFrom('edit', 'ArrowLeft')).toBeUndefined();
  });

  it('starts from the first item when there is no active item, and prevents the scroll', () => {
    expect(moveFrom(undefined, 'ArrowDown')).toMatchObject({ key: 'duplicate' });
    expect(keyInContent(opened(), 'ArrowDown').event.defaultPrevented).toBe(true);
  });

  it('sends nothing for a single item, or none, but still holds the page', () => {
    const only = keyInContent(opened({ items: [edit] }), 'ArrowDown');
    expect(only.send).not.toHaveBeenCalled();
    expect(only.event.defaultPrevented).toBe(true);
    expect(keyInContent(opened({ items: [] }), 'End').send).not.toHaveBeenCalled();
  });
});

describe('typeahead', () => {
  it('moves to the next item whose text starts with the character, from the active item', () => {
    const match = vi.fn(() => 3);
    const result = keyInContent(opened({ typeahead: fakeTypeahead(match) }), 'd');
    expect(match).toHaveBeenCalledWith('d', expect.any(Array), 0);
    expect(result.sent).toMatchObject({ type: 'CONTENT.MOVE', key: 'delete' });
    expect(result.event.defaultPrevented).toBe(true);
  });

  it('hands every item to the typeahead as enabled', () => {
    const match = vi.fn(() => null);
    keyInContent(opened({ typeahead: fakeTypeahead(match) }), 'm');
    const seen = (match.mock.calls[0] as unknown as [string, { disabled: boolean; text: string }[], number])[1];
    expect(seen.map((item) => item.disabled)).toEqual([false, false, false, false]);
    expect(seen.map((item) => item.text)).toEqual(['Edit', 'Duplicate', 'Move', 'Delete']);
  });

  it('finds a disabled item', () => {
    const typeahead = createTypeahead();
    expect(keyInContent(opened({ typeahead }), 'm').sent).toMatchObject({ key: 'move' });
    typeahead.reset();
  });

  it('cycles on a repeated character and ignores case and accents', () => {
    const typeahead = createTypeahead();
    const accented: MenuItemEntry[] = [
      { key: 'a', text: 'Éclair' },
      { key: 'b', text: 'Edit' },
      { key: 'c', text: 'Other' },
    ];
    const state = opened({ items: accented, activeKey: 'c', typeahead });
    expect(keyInContent(state, 'E').sent).toMatchObject({ key: 'a' });
    expect(keyInContent({ ...state, activeKey: 'a' }, 'e').sent).toMatchObject({ key: 'b' });
    typeahead.reset();
  });

  it('does nothing without a match or without a typeahead', () => {
    const none = keyInContent(opened({ typeahead: fakeTypeahead() }), 'z');
    expect(none.send).not.toHaveBeenCalled();
    expect(none.event.defaultPrevented).toBe(false);
    expect(keyInContent(opened(), 'd').send).not.toHaveBeenCalled();
  });

  it('keeps Space for a running search and presses the item otherwise', () => {
    const running = keyInContent(opened({ typeahead: fakeTypeahead(() => 1, true) }), ' ');
    expect(running.sent).toMatchObject({ type: 'CONTENT.MOVE', key: 'duplicate' });
    const noMatch = keyInContent(opened({ typeahead: fakeTypeahead(() => null, true) }), ' ');
    expect(noMatch.send).not.toHaveBeenCalled();
    expect(noMatch.event.defaultPrevented).toBe(true);
    const idle = keyOnItem(opened({ typeahead: fakeTypeahead(() => 1, false) }), edit, ' ');
    expect(idle.sent).toMatchObject({ type: 'ITEM.PRESS', key: 'edit' });
    const typing = keyOnItem(opened({ typeahead: fakeTypeahead(() => 1, true) }), edit, ' ');
    expect(typing.send).not.toHaveBeenCalled();
    expect(typing.event.defaultPrevented).toBe(false);
  });
});

describe('pressing an item', () => {
  it('presses the item the key is on with Enter and Space and holds the default', () => {
    for (const name of ['Enter', ' ']) {
      const result = keyOnItem(opened(), duplicate, name);
      expect(result.sent).toMatchObject({ type: 'ITEM.PRESS', key: 'duplicate' });
      expect(result.event.defaultPrevented).toBe(true);
    }
  });

  it('sends nothing for a disabled item, but holds the default', () => {
    for (const name of ['Enter', ' ']) {
      const result = keyOnItem(opened(), move, name);
      expect(result.send).not.toHaveBeenCalled();
      expect(result.event.defaultPrevented).toBe(true);
    }
  });

  it('ignores other keys, Shift with Enter, and modified, composing or prevented keys', () => {
    expect(keyOnItem(opened(), edit, 'ArrowDown').send).not.toHaveBeenCalled();
    for (const init of [{ shiftKey: true }, { ctrlKey: true }, { isComposing: true }, { defaultPrevented: true }]) {
      const result = keyOnItem(opened(), edit, 'Enter', init);
      expect(result.send).not.toHaveBeenCalled();
    }
  });

  it('presses nothing for a key on the content itself', () => {
    for (const name of ['Enter', ' ']) {
      const result = keyInContent(opened({ typeahead: fakeTypeahead(() => null) }), name);
      expect(result.send).not.toHaveBeenCalled();
      expect(result.event.defaultPrevented).toBe(false);
    }
  });
});

describe('keys the layer handles, and keys left alone', () => {
  it('leaves Escape, Tab and Shift+Tab to the dismissal stack and the focus guards', () => {
    for (const [name, init] of [
      ['Escape', {}],
      ['Tab', {}],
      ['Tab', { shiftKey: true }],
    ] as const) {
      const result = keyInContent(opened(), name, init);
      expect(result.send).not.toHaveBeenCalled();
      expect(result.event.defaultPrevented).toBe(false);
    }
  });

  it('ignores modified, composing and prevented keys', () => {
    for (const init of [
      { ctrlKey: true },
      { altKey: true },
      { metaKey: true },
      { isComposing: true },
      { defaultPrevented: true },
    ]) {
      for (const name of ['ArrowDown', 'Enter', 'd']) {
        const result = keyInContent(opened({ typeahead: fakeTypeahead(() => 1) }), name, init);
        expect(result.send).not.toHaveBeenCalled();
      }
    }
  });

  it('ignores Shift with a named key', () => {
    expect(keyInContent(opened(), 'ArrowDown', { shiftKey: true }).send).not.toHaveBeenCalled();
    expect(keyInContent(opened({ typeahead: fakeTypeahead(() => 1) }), 'D', { shiftKey: true }).sent).toMatchObject({
      type: 'CONTENT.MOVE',
    });
  });
});
