import { describe, expect, it } from 'vitest';
import { resolveNextIndex, resolveTabStop } from '../index';
import type { NextIndexInput } from '../index';

function input(overrides: Partial<NextIndexInput> & { disabled?: readonly number[] }): NextIndexInput {
  const { disabled = [], ...rest } = overrides;
  return {
    key: 'ArrowRight',
    count: 5,
    current: 2,
    isDisabled: (index) => disabled.includes(index),
    orientation: 'horizontal',
    loop: true,
    dir: 'ltr',
    ...rest,
  };
}

describe('resolveNextIndex arrows', () => {
  it.each([
    { name: 'right in ltr', key: 'ArrowRight', orientation: 'horizontal', dir: 'ltr', expected: 3 },
    { name: 'left in ltr', key: 'ArrowLeft', orientation: 'horizontal', dir: 'ltr', expected: 1 },
    { name: 'right in rtl goes back', key: 'ArrowRight', orientation: 'horizontal', dir: 'rtl', expected: 1 },
    { name: 'left in rtl goes forward', key: 'ArrowLeft', orientation: 'horizontal', dir: 'rtl', expected: 3 },
    { name: 'down in vertical', key: 'ArrowDown', orientation: 'vertical', dir: 'ltr', expected: 3 },
    { name: 'up in vertical', key: 'ArrowUp', orientation: 'vertical', dir: 'ltr', expected: 1 },
    { name: 'down in vertical rtl does not flip', key: 'ArrowDown', orientation: 'vertical', dir: 'rtl', expected: 3 },
    { name: 'up in vertical rtl does not flip', key: 'ArrowUp', orientation: 'vertical', dir: 'rtl', expected: 1 },
    { name: 'right in both', key: 'ArrowRight', orientation: 'both', dir: 'ltr', expected: 3 },
    { name: 'down in both', key: 'ArrowDown', orientation: 'both', dir: 'ltr', expected: 3 },
    { name: 'left in both rtl flips', key: 'ArrowLeft', orientation: 'both', dir: 'rtl', expected: 3 },
    { name: 'down in both rtl does not flip', key: 'ArrowDown', orientation: 'both', dir: 'rtl', expected: 3 },
  ] as const)('$name', ({ key, orientation, dir, expected }) => {
    expect(resolveNextIndex(input({ key, orientation, dir }))).toBe(expected);
  });

  it.each([
    { name: 'down in horizontal', key: 'ArrowDown', orientation: 'horizontal' },
    { name: 'right in vertical', key: 'ArrowRight', orientation: 'vertical' },
    { name: 'Enter', key: 'Enter', orientation: 'both' },
    { name: 'a letter', key: 'a', orientation: 'both' },
  ] as const)('does not handle $name', ({ key, orientation }) => {
    expect(resolveNextIndex(input({ key, orientation }))).toBeNull();
  });

  it('skips disabled items', () => {
    expect(resolveNextIndex(input({ disabled: [3, 4] }))).toBe(0);
    expect(resolveNextIndex(input({ key: 'ArrowLeft', disabled: [1] }))).toBe(0);
  });

  it('wraps with loop', () => {
    expect(resolveNextIndex(input({ current: 4 }))).toBe(0);
    expect(resolveNextIndex(input({ current: 0, key: 'ArrowLeft' }))).toBe(4);
  });

  it('stops at the end without loop, and returns the current index', () => {
    expect(resolveNextIndex(input({ current: 4, loop: false }))).toBe(4);
    expect(resolveNextIndex(input({ current: 0, key: 'ArrowLeft', loop: false }))).toBe(0);
    expect(resolveNextIndex(input({ current: 3, loop: false, disabled: [4] }))).toBe(3);
  });

  it('stays on the only enabled item', () => {
    expect(resolveNextIndex(input({ current: 2, disabled: [0, 1, 3, 4] }))).toBe(2);
  });

  it('starts from the first or last enabled item when nothing is current', () => {
    expect(resolveNextIndex(input({ current: -1, disabled: [0] }))).toBe(1);
    expect(resolveNextIndex(input({ current: -1, key: 'ArrowLeft', disabled: [4] }))).toBe(3);
  });

  it('is unhandled for an empty list and for all disabled items', () => {
    expect(resolveNextIndex(input({ count: 0, current: -1 }))).toBeNull();
    expect(resolveNextIndex(input({ disabled: [0, 1, 2, 3, 4] }))).toBeNull();
    expect(resolveNextIndex(input({ key: 'Home', disabled: [0, 1, 2, 3, 4] }))).toBeNull();
    expect(resolveNextIndex(input({ current: -1, disabled: [0, 1, 2, 3, 4] }))).toBeNull();
  });
});

describe('resolveNextIndex Home, End and pages', () => {
  it('goes to the first and last enabled item', () => {
    expect(resolveNextIndex(input({ key: 'Home', disabled: [0] }))).toBe(1);
    expect(resolveNextIndex(input({ key: 'End', disabled: [4] }))).toBe(3);
  });

  it.each([
    { key: 'PageDown', current: 1, pageSize: 2, disabled: [], expected: 3 },
    { key: 'PageDown', current: 3, pageSize: 5, disabled: [], expected: 4 },
    { key: 'PageUp', current: 3, pageSize: 2, disabled: [], expected: 1 },
    { key: 'PageUp', current: 1, pageSize: 5, disabled: [], expected: 0 },
    { key: 'PageDown', current: 0, pageSize: 2, disabled: [2], expected: 3 },
    { key: 'PageDown', current: 1, pageSize: 5, disabled: [4], expected: 3 },
    { key: 'PageDown', current: -1, pageSize: 2, disabled: [], expected: 1 },
    { key: 'PageUp', current: -1, pageSize: 2, disabled: [], expected: 3 },
  ])('$key from $current by $pageSize goes to $expected', ({ key, current, pageSize, disabled, expected }) => {
    expect(resolveNextIndex(input({ key, current, pageSize, disabled }))).toBe(expected);
  });

  it('leaves pages unhandled without a page size', () => {
    expect(resolveNextIndex(input({ key: 'PageDown' }))).toBeNull();
    expect(resolveNextIndex(input({ key: 'PageDown', pageSize: 0 }))).toBeNull();
  });
});

describe('resolveTabStop', () => {
  const items = (...disabled: boolean[]): { disabled: boolean }[] => disabled.map((flag) => ({ disabled: flag }));

  it.each([
    { name: 'the selected item', list: items(false, false, false), selected: 1, expected: 1 },
    { name: 'the first enabled when none is selected', list: items(true, false, false), selected: -1, expected: 1 },
    {
      name: 'the first enabled when the selected one is disabled',
      list: items(false, true, false),
      selected: 1,
      expected: 0,
    },
    {
      name: 'the first enabled when the selected index is out of range',
      list: items(false, false),
      selected: 9,
      expected: 0,
    },
    { name: 'minus one when all are disabled', list: items(true, true), selected: 0, expected: -1 },
    { name: 'minus one for no items', list: items(), selected: -1, expected: -1 },
  ])('is $name', ({ list, selected, expected }) => {
    expect(resolveTabStop(list, selected)).toBe(expected);
  });
});

describe('resolveNextIndex defaults', () => {
  const base = { key: 'ArrowRight', count: 5, current: 4, isDisabled: () => false };
  it.each([
    {
      name: 'no orientation is both',
      left: { ...base, current: 2 },
      right: { ...base, current: 2, orientation: 'both' as const },
    },
    {
      name: 'no orientation moves with ArrowDown',
      left: { ...base, key: 'ArrowDown', current: 2 },
      right: { ...base, key: 'ArrowDown', current: 2, orientation: 'both' as const },
    },
    {
      name: 'no loop is false',
      left: base,
      right: { ...base, loop: false },
    },
    {
      name: 'no dir is ltr',
      left: { ...base, key: 'ArrowLeft', current: 2 },
      right: { ...base, key: 'ArrowLeft', current: 2, dir: 'ltr' as const },
    },
  ])('$name', ({ left, right }) => {
    expect(resolveNextIndex(left)).toBe(resolveNextIndex(right));
  });

  it('no loop stays on the last item, where loop wraps', () => {
    expect(resolveNextIndex(base)).toBe(4);
    expect(resolveNextIndex({ ...base, loop: true })).toBe(0);
  });
});
