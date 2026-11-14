// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRovingFocus } from '../index';
import type { RovingFocusOptions, RovingItem } from '../index';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = '';
});

function mount(labels: string[], disabled: readonly number[] = []): RovingItem[] {
  return labels.map((label, index) => {
    const element = document.createElement('button');
    element.textContent = label;
    document.body.append(element);
    return { element, disabled: disabled.includes(index) };
  });
}

function key(target: Element, init: KeyboardEventInit & { key: string }): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, composed: true, ...init });
  target.dispatchEvent(event);
  return event;
}

type Change = [number, 'keyboard' | 'typeahead'];

function setup(items: RovingItem[], overrides: Partial<RovingFocusOptions> = {}, current = 0) {
  const changes: Change[] = [];
  const roving = createRovingFocus({
    getItems: () => items,
    strategy: 'focus',
    orientation: 'horizontal',
    loop: true,
    getDirection: () => 'ltr',
    getCurrentIndex: () => current,
    onActiveChange: (index, details) => changes.push([index, details.reason]),
    ...overrides,
  });
  const handle = (event: KeyboardEvent): boolean => roving.handleKeyDown(event);
  return { roving, changes, handle };
}

/** Dispatches a key at the target and feeds the same event to the handler, as the caller's listener would. */
function press(
  handler: (event: KeyboardEvent) => boolean,
  target: Element,
  init: KeyboardEventInit & { key: string },
): { handled: boolean; event: KeyboardEvent } {
  let handled = false;
  const listener = (event: Event): void => {
    handled = handler(event as KeyboardEvent);
  };
  target.addEventListener('keydown', listener, { once: true });
  const event = key(target, init);
  target.removeEventListener('keydown', listener);
  return { handled, event };
}

describe('createRovingFocus with focus', () => {
  it('moves DOM focus, reports the index and consumes the key', () => {
    const items = mount(['a', 'b', 'c']);
    const { handle, changes } = setup(items);
    items[0]?.element.focus();
    const { handled, event } = press(handle, items[0]?.element as Element, { key: 'ArrowRight' });
    expect(handled).toBe(true);
    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(items[1]?.element);
    expect(changes).toEqual([[1, 'keyboard']]);
  });

  it('reads the current index from the event target, not from stored state', () => {
    const items = mount(['a', 'b', 'c']);
    const { handle, changes } = setup(items, {}, 0);
    items[2]?.element.focus();
    press(handle, items[2]?.element as Element, { key: 'ArrowLeft' });
    expect(changes).toEqual([[1, 'keyboard']]);
  });

  it('flips the horizontal arrows in rtl', () => {
    const items = mount(['a', 'b', 'c']);
    const { handle, changes } = setup(items, { getDirection: () => 'rtl' });
    press(handle, items[0]?.element as Element, { key: 'ArrowLeft' });
    expect(changes).toEqual([[1, 'keyboard']]);
  });

  it('skips disabled items and wraps', () => {
    const items = mount(['a', 'b', 'c'], [1]);
    const { handle, changes } = setup(items);
    press(handle, items[0]?.element as Element, { key: 'ArrowRight' });
    press(handle, items[2]?.element as Element, { key: 'ArrowRight' });
    expect(changes).toEqual([
      [2, 'keyboard'],
      [0, 'keyboard'],
    ]);
  });

  it('consumes the key at the end without loop but reports no change', () => {
    const items = mount(['a', 'b']);
    const { handle, changes } = setup(items, { loop: false });
    const { handled, event } = press(handle, items[1]?.element as Element, { key: 'ArrowRight' });
    expect(handled).toBe(true);
    expect(event.defaultPrevented).toBe(true);
    expect(changes).toEqual([]);
  });

  it('puts the items into DOM order', () => {
    const items = mount(['a', 'b', 'c']);
    const shuffled = [items[2], items[0], items[1]] as RovingItem[];
    const { handle, changes } = setup(shuffled);
    press(handle, items[0]?.element as Element, { key: 'ArrowRight' });
    expect(changes).toEqual([[1, 'keyboard']]);
    expect(document.activeElement).toBe(items[1]?.element);
  });

  it.each([
    { name: 'a key that is not handled', init: { key: 'Tab' } },
    { name: 'a modified key', init: { key: 'ArrowRight', ctrlKey: true } },
    { name: 'a key with meta', init: { key: 'ArrowRight', metaKey: true } },
    { name: 'a composing key', init: { key: 'ArrowRight', isComposing: true } },
  ])('does not handle $name', ({ init }) => {
    const items = mount(['a', 'b']);
    const { handle, changes } = setup(items);
    const { handled, event } = press(handle, items[0]?.element as Element, init);
    expect(handled).toBe(false);
    expect(event.defaultPrevented).toBe(false);
    expect(changes).toEqual([]);
  });

  it('does not handle a default-prevented key', () => {
    const items = mount(['a', 'b']);
    const { roving, changes } = setup(items);
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight', cancelable: true });
    event.preventDefault();
    expect(roving.handleKeyDown(event)).toBe(false);
    expect(changes).toEqual([]);
  });

  it('supports Home, End and pages', () => {
    const items = mount(['a', 'b', 'c', 'd']);
    const { handle, changes } = setup(items, { pageSize: 2 });
    press(handle, items[1]?.element as Element, { key: 'End' });
    press(handle, items[3]?.element as Element, { key: 'Home' });
    press(handle, items[0]?.element as Element, { key: 'PageDown' });
    expect(changes).toEqual([
      [3, 'keyboard'],
      [0, 'keyboard'],
      [2, 'keyboard'],
    ]);
  });
});

describe('createRovingFocus with active-descendant', () => {
  it('reports the index and leaves DOM focus alone', () => {
    const items = mount(['a', 'b', 'c']);
    const input = document.createElement('input');
    document.body.append(input);
    input.focus();
    const { handle, changes } = setup(items, { strategy: 'active-descendant', orientation: 'vertical' }, 1);
    const { handled } = press(handle, input, { key: 'ArrowDown' });
    expect(handled).toBe(true);
    expect(changes).toEqual([[2, 'keyboard']]);
    expect(document.activeElement).toBe(input);
  });

  it('reads the current index from getCurrentIndex even when the target is an item', () => {
    const items = mount(['a', 'b', 'c']);
    const { handle, changes } = setup(items, { strategy: 'active-descendant', orientation: 'vertical' }, 0);
    press(handle, items[2]?.element as Element, { key: 'ArrowDown' });
    expect(changes).toEqual([[1, 'keyboard']]);
  });
});

describe('createRovingFocus typeahead', () => {
  it('moves to the item that starts with the typed character', () => {
    const items = mount(['Apple', 'Banana', 'Cherry']);
    const { handle, changes } = setup(items, { typeahead: true });
    const { handled } = press(handle, items[0]?.element as Element, { key: 'c' });
    expect(handled).toBe(true);
    expect(changes).toEqual([[2, 'typeahead']]);
    expect(document.activeElement).toBe(items[2]?.element);
  });

  it('does not handle a character that matches nothing, or any character when typeahead is off', () => {
    const items = mount(['Apple', 'Banana']);
    const on = setup(items, { typeahead: true });
    expect(press(on.handle, items[0]?.element as Element, { key: 'z' }).handled).toBe(false);
    const off = setup(items);
    expect(press(off.handle, items[0]?.element as Element, { key: 'b' }).handled).toBe(false);
    expect(off.changes).toEqual([]);
  });
});

describe('createRovingFocus destroy', () => {
  it('stops handling keys and clears the typeahead timer', () => {
    const items = mount(['Apple', 'Banana']);
    const { roving, handle } = setup(items, { typeahead: true });
    press(handle, items[0]?.element as Element, { key: 'b' });
    const pending = vi.getTimerCount();
    roving.destroy();
    expect(vi.getTimerCount()).toBe(pending - 1);
    expect(press(handle, items[0]?.element as Element, { key: 'ArrowRight' }).handled).toBe(false);
  });
});

describe('createRovingFocus defaults', () => {
  /** Presses `key` on the item at `target` of three, with orientation, loop and getDirection left out. */
  function run(key: string, target: number, ancestorDir?: 'rtl'): number[] {
    const wrapper = document.createElement('div');
    if (ancestorDir) wrapper.setAttribute('dir', ancestorDir);
    document.body.append(wrapper);
    const items = mount(['a', 'b', 'c']);
    for (const item of items) wrapper.append(item.element);
    const changes: number[] = [];
    const roving = createRovingFocus({
      getItems: () => items,
      strategy: 'focus',
      getCurrentIndex: () => 0,
      onActiveChange: (index) => changes.push(index),
    });
    press((event) => roving.handleKeyDown(event), items[target]?.element as Element, { key });
    return changes;
  }

  it.each([
    { name: 'no orientation: ArrowRight moves', key: 'ArrowRight', target: 0, dir: undefined, expected: [1] },
    { name: 'no orientation: ArrowDown moves', key: 'ArrowDown', target: 0, dir: undefined, expected: [1] },
    {
      name: 'no loop: ArrowRight on the last item keeps focus',
      key: 'ArrowRight',
      target: 2,
      dir: undefined,
      expected: [],
    },
    {
      name: 'no getDirection and an rtl ancestor: ArrowLeft moves forward',
      key: 'ArrowLeft',
      target: 0,
      dir: 'rtl',
      expected: [1],
    },
  ] as const)('$name', ({ key, target, dir, expected }) => {
    expect(run(key, target, dir)).toEqual(expected);
  });
});
