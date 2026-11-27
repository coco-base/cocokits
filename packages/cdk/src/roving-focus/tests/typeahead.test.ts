// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTypeahead } from '../index';
import type { TypeaheadItem } from '../index';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

function items(...labels: (string | [string, boolean])[]): TypeaheadItem[] {
  return labels.map((label) => {
    const [text, disabled] = typeof label === 'string' ? [label, false] : label;
    return { text: ` ${text} `, disabled };
  });
}

describe('createTypeahead', () => {
  const fruit = items('Apple', 'Apricot', 'Banana', 'Blueberry', 'Cherry');

  it('finds the next item that starts with the character, after the current one', () => {
    const typeahead = createTypeahead();
    expect(typeahead.match('b', fruit, -1)).toBe(2);
    typeahead.reset();
    expect(typeahead.match('b', fruit, 2)).toBe(3);
  });

  it('wraps around and may land on the current item', () => {
    const typeahead = createTypeahead();
    expect(typeahead.match('c', fruit, 4)).toBe(4);
  });

  it('is case-insensitive and ignores surrounding white space of the text', () => {
    const typeahead = createTypeahead();
    expect(typeahead.match('B', fruit, -1)).toBe(2);
  });

  it('refines with a longer buffer from the current item', () => {
    const typeahead = createTypeahead();
    expect(typeahead.match('b', fruit, 0)).toBe(2);
    expect(typeahead.match('l', fruit, 2)).toBe(3);
  });

  it('cycles a repeated character through the matching items', () => {
    const typeahead = createTypeahead();
    expect(typeahead.match('a', fruit, -1)).toBe(0);
    expect(typeahead.match('a', fruit, 0)).toBe(1);
    expect(typeahead.match('a', fruit, 1)).toBe(0);
  });

  it('uses the text of an item over its content', () => {
    const typeahead = createTypeahead();
    const list = [{ element: document.createElement('div'), disabled: false, text: 'Zebra' }];
    expect(typeahead.match('z', list, -1)).toBe(0);
  });

  it('skips disabled items', () => {
    const typeahead = createTypeahead();
    expect(typeahead.match('b', items(['Banana', true], 'Blueberry'), -1)).toBe(1);
  });

  it('returns null when nothing matches', () => {
    const typeahead = createTypeahead();
    expect(typeahead.match('x', fruit, 0)).toBeNull();
    expect(createTypeahead().match('a', [], -1)).toBeNull();
  });

  it('ignores keys that are not one character and a leading space', () => {
    const typeahead = createTypeahead();
    expect(typeahead.match('Enter', fruit, 0)).toBeNull();
    expect(typeahead.match(' ', fruit, 0)).toBeNull();
  });

  it('empties the buffer after the pause', () => {
    const typeahead = createTypeahead({ timeoutMs: 300 });
    expect(typeahead.match('b', fruit, 0)).toBe(2);
    vi.advanceTimersByTime(299);
    expect(typeahead.match('l', fruit, 2)).toBe(3);
    vi.advanceTimersByTime(300);
    expect(typeahead.match('c', fruit, 3)).toBe(4);
  });

  it('keeps the default pause at 500 ms', () => {
    const typeahead = createTypeahead();
    typeahead.match('b', fruit, 0);
    vi.advanceTimersByTime(499);
    expect(typeahead.match('l', fruit, 2)).toBe(3);
    vi.advanceTimersByTime(500);
    expect(typeahead.match('a', fruit, 3)).toBe(0);
  });

  it('empties the buffer on reset', () => {
    const typeahead = createTypeahead();
    typeahead.match('b', fruit, 0);
    typeahead.reset();
    expect(typeahead.match('c', fruit, 2)).toBe(4);
    expect(vi.getTimerCount()).toBe(1);
    typeahead.reset();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('ignores case and accents', () => {
    const typeahead = createTypeahead();
    const list = items('Apple', 'Éclair', 'Cake');
    expect(typeahead.match('e', list, -1)).toBe(1);
    typeahead.reset();
    expect(typeahead.match('A', list, 1)).toBe(0);
    typeahead.reset();
    expect(typeahead.match('é', items('Eclair'), -1)).toBe(0);
  });

  it('extends a running search with a space', () => {
    const typeahead = createTypeahead();
    const cities = items('Newark', 'New York');
    expect(typeahead.match('n', cities, -1)).toBe(0);
    typeahead.match('e', cities, 0);
    typeahead.match('w', cities, 0);
    expect(typeahead.match(' ', cities, 0)).toBe(1);
    expect(typeahead.match('y', cities, 1)).toBe(1);
  });

  it('reports a running search with isActive', () => {
    const typeahead = createTypeahead({ timeoutMs: 300 });
    expect(typeahead.isActive()).toBe(false);
    typeahead.match('b', fruit, 0);
    expect(typeahead.isActive()).toBe(true);
    vi.advanceTimersByTime(300);
    expect(typeahead.isActive()).toBe(false);
    typeahead.match('b', fruit, 0);
    typeahead.reset();
    expect(typeahead.isActive()).toBe(false);
  });
});
