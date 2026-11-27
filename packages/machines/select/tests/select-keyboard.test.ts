import { describe, expect, it, vi } from 'vitest';
import { createTypeahead } from '@cocokits/cdk/roving-focus';
import { getSelectProps, resolveSelectTypeahead, type SelectItem, type SelectState } from '../index';
import { base, fakeTypeahead, key, keyOn, opened } from './fixtures';

describe('keyboard: closed', () => {
  it('opens at the selected or first option with ArrowDown, Alt+ArrowDown, Enter and Space', () => {
    for (const [name, init] of [
      ['ArrowDown', {}],
      ['ArrowDown', { altKey: true }],
      ['Enter', {}],
      [' ', {}],
    ] as const) {
      const result = keyOn(base(), name, init);
      expect(result.sent).toMatchObject({ type: 'TRIGGER.OPEN', initial: 'selected' });
      expect(result.event.defaultPrevented).toBe(true);
    }
  });

  it('opens at the first option with ArrowUp, and at the first or last with Home and End', () => {
    expect(keyOn(base({ value: 'Steak' }), 'ArrowUp').sent).toMatchObject({ initial: 'first' });
    expect(keyOn(base(), 'Home').sent).toMatchObject({ initial: 'first' });
    expect(keyOn(base(), 'End').sent).toMatchObject({ initial: 'last' });
  });

  it('opens at the next typeahead match, searching from the selected option', () => {
    const match = vi.fn(() => 2);
    const result = keyOn(base({ value: 'Cake', typeahead: fakeTypeahead(match) }), 'b');
    expect(match).toHaveBeenCalledWith('b', expect.any(Array), 0);
    expect(result.sent).toMatchObject({ type: 'TRIGGER.OPEN', initial: { key: 'burger' } });
    expect(result.event.defaultPrevented).toBe(true);
  });

  it('matches the option text, then its label, then itemToStringLabel of the value', () => {
    const match = vi.fn(() => null);
    const withText: SelectItem<number>[] = [
      { key: 'a', value: 1, text: 'One', label: 'Uno' },
      { key: 'b', value: 2 },
      { key: 'c', value: 3, label: 'Tres' },
    ];
    const state: SelectState<number> = {
      id: 's',
      open: false,
      items: withText,
      itemToStringLabel: (v) => `n${String(v)}`,
      typeahead: fakeTypeahead(match),
    };
    getSelectProps(state, vi.fn()).trigger.onKeyDown(key('o'));
    const rovingItems = (match.mock.calls[0] as unknown as [string, { text: string }[], number])[1];
    expect(rovingItems.map((item) => item.text)).toEqual(['One', 'n2', 'Tres']);
  });

  it('does nothing for a printable character without a match or without a typeahead', () => {
    const none = keyOn(base({ typeahead: fakeTypeahead() }), 'z');
    expect(none.send).not.toHaveBeenCalled();
    expect(none.event.defaultPrevented).toBe(false);
    expect(keyOn(base(), 'b').send).not.toHaveBeenCalled();
  });

  it('never opens while disabled or read-only, and leaves the key alone', () => {
    for (const over of [{ disabled: true }, { readOnly: true }]) {
      const result = keyOn(base(over), 'ArrowDown');
      expect(result.send).not.toHaveBeenCalled();
      expect(result.event.defaultPrevented).toBe(false);
    }
  });
});

describe('keyboard: open', () => {
  it('moves to the next and previous enabled option and stops at the ends', () => {
    expect(keyOn(opened(), 'ArrowDown').sent).toMatchObject({ type: 'LIST.MOVE', key: 'burger' });
    expect(keyOn(opened({ highlighted: 'burger' }), 'ArrowUp').sent).toMatchObject({ key: 'cake' });
    const atEnd = keyOn(opened({ highlighted: 'steak' }), 'ArrowDown');
    expect(atEnd.send).not.toHaveBeenCalled();
    expect(atEnd.event.defaultPrevented).toBe(true);
    expect(keyOn(opened({ highlighted: 'cake' }), 'ArrowUp').send).not.toHaveBeenCalled();
  });

  it('starts from the ends when nothing is highlighted', () => {
    expect(keyOn(opened({ highlighted: undefined }), 'ArrowDown').sent).toMatchObject({ key: 'cake' });
    expect(keyOn(opened({ highlighted: undefined }), 'ArrowUp').sent).toMatchObject({ key: 'steak' });
  });

  it('goes to the first and last enabled option with Home and End', () => {
    expect(keyOn(opened({ highlighted: 'burger' }), 'Home').sent).toMatchObject({ key: 'cake' });
    expect(keyOn(opened(), 'End').sent).toMatchObject({ key: 'steak' });
  });

  it('moves by 10 options with PageDown and PageUp, landing on the nearest enabled option', () => {
    expect(keyOn(opened(), 'PageDown').sent).toMatchObject({ key: 'steak' });
    expect(keyOn(opened({ highlighted: 'steak' }), 'PageUp').sent).toMatchObject({ key: 'cake' });
  });

  it('follows the typeahead match', () => {
    const match = vi.fn(() => 3);
    expect(keyOn(opened({ typeahead: fakeTypeahead(match) }), 's').sent).toMatchObject({
      type: 'LIST.MOVE',
      key: 'steak',
    });
    expect(match).toHaveBeenCalledWith('s', expect.any(Array), 0);
  });

  it('chooses with Enter and Space', () => {
    for (const name of ['Enter', ' ']) {
      const result = keyOn(opened(), name);
      expect(result.sent).toMatchObject({ type: 'LIST.CHOOSE' });
      expect(result.event.defaultPrevented).toBe(true);
    }
  });

  it('chooses and closes with Alt+ArrowUp, and ignores Alt+ArrowDown', () => {
    expect(keyOn(opened(), 'ArrowUp', { altKey: true }).sent).toMatchObject({ type: 'LIST.CHOOSE_AND_CLOSE' });
    expect(keyOn(opened(), 'ArrowDown', { altKey: true }).send).not.toHaveBeenCalled();
  });

  it('dismisses with reason blur on Tab in a single Select (which commits), without stopping the Tab', () => {
    for (const init of [{}, { shiftKey: true }]) {
      const result = keyOn(opened(), 'Tab', init);
      expect(result.sent).toMatchObject({ type: 'LIST.DISMISS', reason: 'blur' });
      expect(result.event.defaultPrevented).toBe(false);
    }
  });

  it('only closes on Tab with multiple', () => {
    const result = keyOn(opened({ multiple: true }), 'Tab');
    expect(result.sent).toMatchObject({ type: 'LIST.DISMISS', reason: 'blur' });
    expect(result.event.defaultPrevented).toBe(false);
  });

  it('adds Space to a running search instead of choosing', () => {
    const match = vi.fn(() => 2);
    const result = keyOn(opened({ typeahead: fakeTypeahead(match, true) }), ' ');
    expect(match).toHaveBeenCalledWith(' ', expect.any(Array), 0);
    expect(result.sent).toMatchObject({ type: 'LIST.MOVE', key: 'burger' });
    expect(result.event.defaultPrevented).toBe(true);
  });

  it('swallows Space during a search that finds nothing: it neither opens nor chooses', () => {
    for (const state of [
      opened({ typeahead: fakeTypeahead(() => null, true) }),
      base({ typeahead: fakeTypeahead(() => null, true) }),
    ]) {
      const result = keyOn(state, ' ');
      expect(result.send).not.toHaveBeenCalled();
      expect(result.event.defaultPrevented).toBe(true);
    }
  });

  it('opens the list on Space when no search is running', () => {
    expect(keyOn(base({ typeahead: fakeTypeahead(() => 2) }), ' ').sent).toMatchObject({ type: 'TRIGGER.OPEN' });
    expect(keyOn(opened({ typeahead: fakeTypeahead(() => 2) }), ' ').sent).toMatchObject({ type: 'LIST.CHOOSE' });
  });

  it('closes on Escape without a choice', () => {
    const result = keyOn(opened(), 'Escape');
    expect(result.sent).toMatchObject({ type: 'LIST.DISMISS', reason: 'escape' });
    expect(result.event.defaultPrevented).toBe(true);
  });
});

describe('keyboard: ignored keys', () => {
  it('ignores a vetoed key, a composing key, Ctrl and Meta combinations and unlisted keys', () => {
    const vetoed = key('ArrowDown');
    vetoed.preventDefault();
    const send = vi.fn();
    getSelectProps(base(), send).trigger.onKeyDown(vetoed);
    expect(send).not.toHaveBeenCalled();
    expect(keyOn(base(), 'ArrowDown', { isComposing: true }).send).not.toHaveBeenCalled();
    expect(keyOn(base(), 'ArrowDown', { ctrlKey: true }).send).not.toHaveBeenCalled();
    expect(keyOn(base(), 'ArrowDown', { metaKey: true }).send).not.toHaveBeenCalled();
    expect(keyOn(base(), 'Enter', { altKey: true }).send).not.toHaveBeenCalled();
    expect(keyOn(opened({ typeahead: fakeTypeahead(() => 1) }), 'a', { ctrlKey: true }).send).not.toHaveBeenCalled();
    expect(keyOn(opened(), 'ArrowRight').send).not.toHaveBeenCalled();
    expect(keyOn(opened(), 'Shift').send).not.toHaveBeenCalled();
  });

  it('does not move on a vertical key flipped by direction: vertical keys never flip', () => {
    expect(keyOn(opened(), 'ArrowDown').sent).toMatchObject({ key: 'burger' });
  });
});

describe('resolveSelectTypeahead', () => {
  it('ignores case and accents, and takes a space as part of the search', () => {
    const accents: SelectItem[] = [
      { key: 'e', value: 'Éclair' },
      { key: 'n', value: 'New York' },
      { key: 'm', value: 'New Mexico' },
    ];
    const typeahead = createTypeahead();
    expect(resolveSelectTypeahead(base({ items: accents, typeahead }), 'e')).toBe('e');
    typeahead.reset();
    expect(resolveSelectTypeahead(base({ items: accents, typeahead }), 'n')).toBe('n');
    expect(resolveSelectTypeahead(base({ items: accents, typeahead }), 'e')).toBe('n');
    expect(resolveSelectTypeahead(base({ items: accents, typeahead }), 'w')).toBe('n');
    expect(resolveSelectTypeahead(base({ items: accents, typeahead }), ' ')).toBe('n');
    expect(resolveSelectTypeahead(base({ items: accents, typeahead }), 'm')).toBe('m');
    typeahead.reset();
  });

  it('starts after the selected option while closed and after the highlighted one while open', () => {
    const typeahead = createTypeahead();
    expect(resolveSelectTypeahead(base({ typeahead }), 's')).toBe('steak');
    typeahead.reset();
    expect(resolveSelectTypeahead(base({ typeahead, value: 'Steak' }), 's')).toBe('steak');
    typeahead.reset();
    expect(resolveSelectTypeahead(opened({ typeahead, highlighted: 'steak' }), 's')).toBe('steak');
    typeahead.reset();
    expect(resolveSelectTypeahead(opened({ typeahead, highlighted: 'cake' }), 'b')).toBe('burger');
    typeahead.reset();
  });

  it('finds nothing without a buffer, with no items, or for a character no option starts with', () => {
    expect(resolveSelectTypeahead(base(), 's')).toBeNull();
    expect(resolveSelectTypeahead(base({ items: [], typeahead: createTypeahead() }), 's')).toBeNull();
    const typeahead = createTypeahead();
    expect(resolveSelectTypeahead(base({ typeahead }), 'z')).toBeNull();
    typeahead.reset();
  });
});
