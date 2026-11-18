import { describe, expect, it } from 'vitest';
import { chipAnatomy, chipMeta, getChipProps, type ChipProps } from '../index';

const keysOf = (props: object | null, prefix: string): string[] =>
  Object.entries(props ?? {})
    .filter(([key, value]) => key.startsWith(prefix) && value !== undefined)
    .map(([key]) => key);

describe('chipAnatomy', () => {
  it('names the classes of the Anatomy table', () => {
    expect(chipAnatomy.classes).toEqual({
      root: 'cck-chip',
      contentWrapper: 'cck-chip__content-wrapper',
      check: 'cck-chip__check',
      remove: 'cck-chip__remove',
    });
  });
});

describe('getChipProps', () => {
  it('renders the classes and the content id derived from the chip id', () => {
    const { root, contentWrapper, remove, check } = getChipProps({ id: 'c1' });
    expect(root).toMatchObject({ class: 'cck-chip', id: 'c1' });
    expect(contentWrapper).toEqual({ class: 'cck-chip__content-wrapper', id: 'c1-content' });
    expect(remove).toBeNull();
    expect(check).toBeNull();
  });

  it('marks a disabled chip on the root', () => {
    expect(getChipProps({ id: 'c1', disabled: true }).root['data-disabled']).toBe('');
  });

  it('renders no data attribute on an enabled plain chip', () => {
    const { root, contentWrapper, remove } = getChipProps({ id: 'c1', removable: true });
    expect(keysOf(root, 'data-')).toEqual([]);
    expect(keysOf(contentWrapper, 'data-')).toEqual([]);
    expect(keysOf(remove, 'data-')).toEqual([]);
  });
});

describe('selectable chip (chip-01)', () => {
  it.each([
    ['selected', true, 'true', '', 'checked'],
    ['not selected', false, 'false', undefined, undefined],
  ])('is a toggle button while %s', (_name, selected, pressed, dataSelected, checkState) => {
    const { contentWrapper, check } = getChipProps({ id: 'c1', selected });
    expect(contentWrapper).toMatchObject({
      type: 'button',
      'aria-pressed': pressed,
      'data-selected': dataSelected,
      id: 'c1-content',
    });
    expect(check).toEqual({ class: 'cck-chip__check', 'aria-hidden': 'true', 'data-state': checkState });
  });

  it('is a plain span, no toggle and no check, while `selected` is undefined', () => {
    const { contentWrapper, check } = getChipProps({ id: 'c1', selected: undefined });
    expect(contentWrapper).toEqual({ class: 'cck-chip__content-wrapper', id: 'c1-content' });
    expect(check).toBeNull();
  });

  it('disables the toggle natively while the chip is disabled', () => {
    const { contentWrapper, root } = getChipProps({ id: 'c1', selected: false, disabled: true });
    expect(contentWrapper.disabled).toBe(true);
    expect(root['data-disabled']).toBe('');
    expect(getChipProps({ id: 'c1', selected: false }).contentWrapper.disabled).toBeUndefined();
  });

  it('never changes the label: the pressed state is aria-pressed alone', () => {
    const on = getChipProps({ id: 'c1', selected: true, removable: true });
    const off = getChipProps({ id: 'c1', selected: false, removable: true });
    expect(on.contentWrapper.id).toBe(off.contentWrapper.id);
    expect(on.remove).toEqual(off.remove);
  });
});

describe('remove button (chip-06, chip-08)', () => {
  const cases: readonly [string, ChipProps, 'absent' | object][] = [
    ['not removable', { id: 'c1' }, 'absent'],
    ['removable', { id: 'c1', removable: true }, { 'aria-label': 'Remove', 'aria-labelledby': 'c1-remove c1-content' }],
    ['removable and disabled', { id: 'c1', removable: true, disabled: true }, 'absent'],
    [
      'removable with removeLabel',
      { id: 'c1', removable: true, removeLabel: 'Delete Pizza' },
      { 'aria-label': 'Delete Pizza', 'aria-labelledby': undefined },
    ],
    [
      'removable with an empty removeLabel',
      { id: 'c1', removable: true, removeLabel: '' },
      { 'aria-label': 'Remove', 'aria-labelledby': 'c1-remove c1-content' },
    ],
    [
      'removable with another removeText',
      { id: 'c1', removable: true, removeText: 'Entfernen' },
      { 'aria-label': 'Entfernen', 'aria-labelledby': 'c1-remove c1-content' },
    ],
    [
      'selectable, removable and enabled',
      { id: 'c1', removable: true, selected: true },
      { 'aria-label': 'Remove', 'aria-labelledby': 'c1-remove c1-content' },
    ],
    ['selectable, removable and disabled', { id: 'c1', removable: true, selected: true, disabled: true }, 'absent'],
  ];

  it.each(cases)('%s', (_name, props, expected) => {
    const { remove } = getChipProps(props);
    if (expected === 'absent') {
      expect(remove).toBeNull();
      return;
    }
    expect(remove).toMatchObject({ class: 'cck-chip__remove', type: 'button', id: 'c1-remove', ...expected });
  });

  it('is a sibling of the content, never a part of the toggle: it has its own id and no data attribute', () => {
    const { remove, contentWrapper } = getChipProps({ id: 'c1', removable: true, selected: true });
    expect(remove?.id).not.toBe(contentWrapper.id);
    expect(keysOf(remove, 'data-')).toEqual([]);
  });
});

describe('meta and props agree', () => {
  it('renders only data attributes the meta declares', () => {
    const { root, contentWrapper, check, remove } = getChipProps({
      id: 'c1',
      removable: true,
      selected: true,
      disabled: true,
    });
    expect(keysOf(root, 'data-')).toEqual(chipMeta.dataAttrs.root);
    expect(keysOf(contentWrapper, 'data-')).toEqual(chipMeta.dataAttrs.contentWrapper);
    expect(keysOf(check, 'data-')).toEqual(chipMeta.dataAttrs.check);
    expect(keysOf(remove, 'data-')).toEqual(chipMeta.dataAttrs.remove);
  });
});

describe('chipMeta', () => {
  it('declares no roles, the default elements and no form behaviour', () => {
    expect(chipMeta.roles).toEqual({ root: null, contentWrapper: null, check: null, remove: null });
    expect(chipMeta.defaultElements).toEqual({
      root: 'div',
      contentWrapper: 'span',
      check: 'span',
      remove: 'button',
    });
    expect(chipMeta.form).toMatch(/^None/);
  });

  it('has the toggle and the remove keyboard rows', () => {
    expect(chipMeta.keyboard.map((row) => `${row.key} | ${row.context}`)).toEqual([
      'Enter, Space | selectable chip',
      'Enter, Space | remove button',
    ]);
  });
});
