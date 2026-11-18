import { describe, expect, it } from 'vitest';
import {
  addChipListValue,
  getChipListBackspaceTarget,
  getChipListChipFacts,
  getChipListFocusAfterRemove,
  getChipListProps,
  getChipListRemoveKey,
  removeChipListValue,
  toggleChipListItem,
  type ChipListEntry,
  type ChipListKeyEvent,
} from '../index';

const press = (over: Partial<ChipListKeyEvent> = {}): ChipListKeyEvent => ({
  key: 'Backspace',
  shiftKey: false,
  ctrlKey: false,
  altKey: false,
  metaKey: false,
  isComposing: false,
  ...over,
});

const textOf = (entry: ChipListEntry): string => (typeof entry === 'string' ? entry : entry.value);

describe('item objects (chip-list-01, -04)', () => {
  const list: readonly ChipListEntry[] = [
    'Steak',
    { value: 'Pizza', selected: false },
    { value: 'Burger', removable: false },
    { value: 'Salad', disabled: true },
  ];

  it.each([
    ['a string', 'Steak', false, { value: 'Steak', removable: true, disabled: false, selected: undefined }],
    ['an empty item', { value: 'a' }, false, { value: 'a', removable: true, disabled: false, selected: undefined }],
    [
      'a selectable item',
      { value: 'a', selected: false },
      false,
      { value: 'a', removable: true, disabled: false, selected: false },
    ],
    [
      'a not removable item',
      { value: 'a', removable: false },
      false,
      { value: 'a', removable: false, disabled: false, selected: undefined },
    ],
    [
      'a disabled item',
      { value: 'a', disabled: true },
      false,
      { value: 'a', removable: true, disabled: true, selected: undefined },
    ],
    ['a string in a disabled list', 'a', true, { value: 'a', removable: true, disabled: true, selected: undefined }],
    [
      'an item in a disabled list',
      { value: 'a', selected: true },
      true,
      { value: 'a', removable: true, disabled: true, selected: true },
    ],
  ] as const)('gives the chip the facts of %s', (_name, entry, listDisabled, expected) => {
    expect(getChipListChipFacts(entry, listDisabled)).toEqual(expected);
  });

  it('gives each chip its facts through `chip`, merging the list disabled state', () => {
    const open = getChipListProps({ value: list });
    expect(open.chip({ value: 'a', selected: true }).selected).toBe(true);
    expect(open.chip('a').disabled).toBe(false);
    const locked = getChipListProps({ value: list, readOnly: true });
    expect(locked.chip({ value: 'a', selected: true })).toMatchObject({ disabled: true, selected: true });
  });

  it('submits the text of every entry, strings and items alike', () => {
    expect(getChipListProps({ value: list, name: 'food' }).formInput.values).toEqual([
      'Steak',
      'Pizza',
      'Burger',
      'Salad',
    ]);
  });

  it('counts an item value as present, so a duplicate text is not added', () => {
    expect(addChipListValue(list, 'Pizza')).toBe(list);
    expect(addChipListValue(list, ' Sushi ')).toEqual([...list, 'Sushi']);
  });

  it.each([
    ['a string', 0, ['Pizza', 'Burger', 'Salad']],
    ['a selectable item', 1, ['Steak', 'Burger', 'Salad']],
  ])('removes %s', (_name, index, values) => {
    expect(removeChipListValue(list, index).map(textOf)).toEqual(values);
  });

  it.each([
    ['a not removable item', 2],
    ['a disabled item', 3],
  ])('keeps %s', (_name, index) => {
    expect(removeChipListValue(list, index)).toBe(list);
  });

  it('toggles a selectable item with a copy and leaves the rest', () => {
    const toggled = toggleChipListItem(list, 1);
    expect(toggled[1]).toEqual({ value: 'Pizza', selected: true });
    expect(toggled[0]).toBe(list[0]);
    expect(list[1]).toEqual({ value: 'Pizza', selected: false });
    expect(toggleChipListItem(toggled, 1)[1]).toEqual({ value: 'Pizza', selected: false });
  });

  it.each([
    ['a string', 0],
    ['an item with no selected', 2],
    ['a disabled item', 3],
    ['an index outside the list', 9],
    ['a fractional index', 1.5],
  ])('toggles nothing for %s', (_name, index) => {
    expect(toggleChipListItem(list, index)).toBe(list);
  });

  it('toggles a disabled selectable item no more than a plain disabled one', () => {
    const value = [{ value: 'a', selected: true, disabled: true }];
    expect(toggleChipListItem(value, 0)).toBe(value);
  });
});

describe('Backspace in the empty text box (chip-list-05)', () => {
  const list: readonly ChipListEntry[] = [
    'a',
    { value: 'b', selected: true, removable: false },
    { value: 'c', disabled: true },
  ];

  it('targets the last chip that holds a focus stop', () => {
    expect(getChipListBackspaceTarget(press(), '', ['a', 'b'])).toBe(1);
    expect(getChipListBackspaceTarget(press(), '', list)).toBe(1);
  });

  it.each([
    ['text in the box', press(), 'x', ['a']],
    ['another key', press({ key: 'Delete' }), '', ['a']],
    ['Shift', press({ shiftKey: true }), '', ['a']],
    ['Ctrl', press({ ctrlKey: true }), '', ['a']],
    ['Alt', press({ altKey: true }), '', ['a']],
    ['Meta', press({ metaKey: true }), '', ['a']],
    ['an IME composition', press({ isComposing: true }), '', ['a']],
    ['the composition key code 229', press({ keyCode: 229 }), '', ['a']],
    ['no chips', press(), '', []],
    ['only disabled chips', press(), '', [{ value: 'c', disabled: true }]],
    ['only chips with no focus stop', press(), '', [{ value: 'c', removable: false }]],
  ])('does nothing for %s', (_name, event, draft, value) => {
    expect(getChipListBackspaceTarget(event, draft, value)).toBeNull();
  });
});

describe('Backspace and Delete on a focused chip (chip-list-05)', () => {
  it.each([
    ['Backspace', press(), 'Backspace'],
    ['Delete', press({ key: 'Delete' }), 'Delete'],
    ['another key', press({ key: 'a' }), null],
    ['Backspace with Ctrl', press({ ctrlKey: true }), null],
    ['Delete with Shift', press({ key: 'Delete', shiftKey: true }), null],
    ['Backspace in a composition', press({ isComposing: true }), null],
  ])('maps %s', (_name, event, expected) => {
    expect(getChipListRemoveKey(event)).toBe(expected);
  });

  const list: readonly ChipListEntry[] = ['a', 'b', { value: 'c', disabled: true }, 'd'];

  it.each([
    ['Backspace on the middle chip', 1, 'Backspace', 0],
    ['Backspace on the first chip', 0, 'Backspace', 'input'],
    ['Backspace past a disabled chip', 3, 'Backspace', 1],
    ['Delete on the first chip', 0, 'Delete', 0],
    ['Delete past a disabled chip', 1, 'Delete', 2],
    ['Delete on the last chip', 3, 'Delete', 'input'],
  ] as const)('moves focus after %s', (_name, index, key, expected) => {
    expect(getChipListFocusAfterRemove(list, index, key)).toBe(expected);
  });

  it('points Delete at the position the next chip has after the removal', () => {
    const after = removeChipListValue(['a', 'b', 'c'], 0);
    const target = getChipListFocusAfterRemove(['a', 'b', 'c'], 0, 'Delete');
    expect(after[target as number]).toBe('b');
  });
});
