import { describe, expect, it } from 'vitest';
import { resolveSelectHighlight, transitionSelect, type SelectItem, type SelectState } from '../index';
import { base, event, items, opened } from './fixtures';

describe('transitionSelect: opening and closing', () => {
  it('opens on a click and highlights the selected option, else the first enabled one', () => {
    expect(transitionSelect(base({ value: 'Steak' }), { type: 'TRIGGER.CLICK', event })).toEqual({
      open: { open: true, reason: 'trigger' },
      highlight: 'steak',
      reveal: true,
    });
    expect(transitionSelect(base(), { type: 'TRIGGER.CLICK', event })).toMatchObject({ highlight: 'cake' });
    expect(transitionSelect(base({ items: items.slice(1) }), { type: 'TRIGGER.CLICK', event })).toMatchObject({
      highlight: 'burger',
    });
  });

  it('closes on a click and clears the highlight', () => {
    expect(transitionSelect(opened(), { type: 'TRIGGER.CLICK', event })).toEqual({
      open: { open: false, reason: 'trigger' },
      highlight: null,
    });
  });

  it('never opens while disabled or read-only', () => {
    for (const over of [{ disabled: true }, { readOnly: true }]) {
      expect(transitionSelect(base(over), { type: 'TRIGGER.CLICK', event })).toBeNull();
      expect(transitionSelect(base(over), { type: 'TRIGGER.OPEN', initial: 'first', event })).toBeNull();
    }
  });

  it('opens by key at the first, last, selected or a given option', () => {
    const open = (initial: 'first' | 'last' | 'selected' | { key: string }) =>
      transitionSelect(base({ value: 'Burger' }), { type: 'TRIGGER.OPEN', initial, event });
    expect(open('first')).toMatchObject({ open: { open: true, reason: 'trigger' }, highlight: 'cake', reveal: true });
    expect(open('last')).toMatchObject({ highlight: 'steak' });
    expect(open('selected')).toMatchObject({ highlight: 'burger' });
    expect(open({ key: 'steak' })).toMatchObject({ highlight: 'steak' });
  });

  it('closes with the reason of the dismissal, without a choice for Escape and an outside press that kept focus', () => {
    for (const reason of ['escape', 'outside-press'] as const) {
      expect(transitionSelect(opened(), { type: 'LIST.DISMISS', reason, event: null })).toEqual({
        open: { open: false, reason },
        highlight: null,
      });
    }
    expect(transitionSelect(base(), { type: 'LIST.DISMISS', reason: 'escape', event: null })).toBeNull();
  });
});

describe('transitionSelect: focus leaving the trigger', () => {
  const blur = { type: 'LIST.DISMISS', reason: 'blur', event } as const;

  it('chooses the highlighted option of a single Select and closes with reason blur', () => {
    expect(transitionSelect(opened({ highlighted: 'steak' }), blur)).toEqual({
      value: 'Steak',
      open: { open: false, reason: 'blur' },
      highlight: null,
    });
  });

  it('chooses after an outside press only when focus left the trigger', () => {
    const press = { type: 'LIST.DISMISS', reason: 'outside-press', event } as const;
    expect(transitionSelect(opened(), { ...press, focusLeft: true })).toEqual({
      value: 'Cake',
      open: { open: false, reason: 'outside-press' },
      highlight: null,
    });
    expect(transitionSelect(opened(), press)).toEqual({
      open: { open: false, reason: 'outside-press' },
      highlight: null,
    });
  });

  it('closes without a change when the highlighted option is the value, disabled, or missing', () => {
    const plain = { open: { open: false, reason: 'blur' }, highlight: null };
    expect(transitionSelect(opened({ value: 'Cake' }), blur)).toEqual(plain);
    expect(transitionSelect(opened({ highlighted: 'pizza' }), blur)).toEqual(plain);
    expect(transitionSelect(opened({ highlighted: undefined }), blur)).toEqual(plain);
  });

  it('closes a multiple Select without a change', () => {
    expect(transitionSelect(opened({ multiple: true, value: [] }), blur)).toEqual({
      open: { open: false, reason: 'blur' },
      highlight: null,
    });
  });

  it('clears with a null option', () => {
    const withNone: SelectItem<string | null>[] = [{ key: 'none', value: null }, ...items];
    const state: SelectState<string | null> = {
      id: 's1',
      open: true,
      items: withNone,
      value: 'Cake',
      highlighted: 'none',
    };
    expect(transitionSelect(state, blur)).toMatchObject({ value: null, open: { open: false, reason: 'blur' } });
  });
});

describe('transitionSelect: highlight', () => {
  it('moves the highlight by key with reveal, and by pointer without it', () => {
    expect(transitionSelect(opened(), { type: 'LIST.MOVE', key: 'steak', event })).toEqual({
      highlight: 'steak',
      reveal: true,
    });
    expect(transitionSelect(opened(), { type: 'OPTION.POINTER_MOVE', key: 'steak', event })).toEqual({
      highlight: 'steak',
    });
  });

  it('ignores a pointer move over the highlighted or a disabled option', () => {
    expect(transitionSelect(opened(), { type: 'OPTION.POINTER_MOVE', key: 'cake', event })).toBeNull();
    expect(transitionSelect(opened(), { type: 'OPTION.POINTER_MOVE', key: 'pizza', event })).toBeNull();
  });
});

describe('transitionSelect: choosing', () => {
  it('sets the value and closes in a single Select', () => {
    expect(transitionSelect(opened(), { type: 'OPTION.CLICK', key: 'burger', event })).toEqual({
      value: 'Burger',
      open: { open: false, reason: 'select' },
      highlight: null,
    });
  });

  it('closes without a value change when the option is already selected', () => {
    expect(transitionSelect(opened({ value: 'Burger' }), { type: 'OPTION.CLICK', key: 'burger', event })).toEqual({
      open: { open: false, reason: 'select' },
      highlight: null,
    });
  });

  it('chooses the empty string to clear a single Select', () => {
    const withNone: SelectItem[] = [{ key: 'none', value: '' }, ...items];
    expect(
      transitionSelect(opened({ items: withNone, value: 'Cake' }), { type: 'OPTION.CLICK', key: 'none', event }),
    ).toMatchObject({ value: '', open: { open: false, reason: 'select' } });
  });

  it('clears a single Select with a null or undefined option, unless nullable options are selectable', () => {
    const state: SelectState<string | null | undefined> = {
      id: 's',
      open: true,
      items: [
        { key: 'none', value: null },
        { key: 'u', value: undefined },
        { key: 'a', value: 'A' },
      ],
      value: 'A',
    };
    const closedOnly = { open: { open: false, reason: 'select' }, highlight: null };
    expect(transitionSelect(state, { type: 'OPTION.CLICK', key: 'none', event })).toMatchObject({ value: null });
    expect(transitionSelect(state, { type: 'OPTION.CLICK', key: 'u', event })).toMatchObject({ value: null });
    expect(transitionSelect({ ...state, value: null }, { type: 'OPTION.CLICK', key: 'none', event })).toEqual(
      closedOnly,
    );
    const nullable = { ...state, canSelectNullableOptions: true };
    expect(transitionSelect(nullable, { type: 'OPTION.CLICK', key: 'none', event })).toMatchObject({ value: null });
    expect(transitionSelect({ ...nullable, value: null }, { type: 'OPTION.CLICK', key: 'none', event })).toEqual(
      closedOnly,
    );
  });

  it('orders the values of a multiple Select with orderValues', () => {
    const state = opened({
      multiple: true,
      value: ['Steak'],
      orderValues: (values) => items.map((item) => item.value).filter((value) => values.includes(value)),
    });
    expect(transitionSelect(state, { type: 'OPTION.CLICK', key: 'cake', event })).toEqual({
      value: ['Cake', 'Steak'],
    });
  });

  it('ignores a disabled option and an unknown key', () => {
    expect(transitionSelect(opened(), { type: 'OPTION.CLICK', key: 'pizza', event })).toBeNull();
    expect(transitionSelect(opened(), { type: 'OPTION.CLICK', key: 'nope', event })).toBeNull();
  });

  it('toggles membership and stays open with multiple', () => {
    const state = opened({ multiple: true, value: ['Cake'] });
    expect(transitionSelect(state, { type: 'OPTION.CLICK', key: 'steak', event })).toEqual({
      value: ['Cake', 'Steak'],
    });
    expect(transitionSelect(state, { type: 'OPTION.CLICK', key: 'cake', event })).toEqual({ value: [] });
    expect(transitionSelect(opened({ multiple: true }), { type: 'OPTION.CLICK', key: 'cake', event })).toEqual({
      value: ['Cake'],
    });
  });

  it('chooses the highlighted option on Enter or Space', () => {
    expect(transitionSelect(opened({ highlighted: 'steak' }), { type: 'LIST.CHOOSE', event })).toMatchObject({
      value: 'Steak',
      open: { open: false, reason: 'select' },
    });
    expect(transitionSelect(opened({ highlighted: undefined }), { type: 'LIST.CHOOSE', event })).toBeNull();
  });

  it('chooses and closes also with multiple, and closes with reason blur when nothing is highlighted', () => {
    expect(
      transitionSelect(opened({ multiple: true, value: [], highlighted: 'steak' }), {
        type: 'LIST.CHOOSE_AND_CLOSE',
        event,
      }),
    ).toEqual({ value: ['Steak'], open: { open: false, reason: 'select' }, highlight: null });
    expect(transitionSelect(opened({ highlighted: undefined }), { type: 'LIST.CHOOSE_AND_CLOSE', event })).toEqual({
      open: { open: false, reason: 'blur' },
      highlight: null,
    });
  });

  it('compares values with isItemEqual', () => {
    const objects = [
      { key: 'a', value: { id: 1 } },
      { key: 'b', value: { id: 2 } },
    ];
    const state: SelectState<{ id: number }> = {
      id: 's',
      open: true,
      items: objects,
      value: { id: 2 },
      isItemEqual: (a, b) => a.id === b.id,
    };
    expect(transitionSelect(state, { type: 'OPTION.CLICK', key: 'b', event })).toEqual({
      open: { open: false, reason: 'select' },
      highlight: null,
    });
    expect(transitionSelect(state, { type: 'OPTION.CLICK', key: 'a', event })).toMatchObject({ value: { id: 1 } });
  });
});

describe('resolveSelectHighlight', () => {
  it('finds the selected, first, last or given option and skips the disabled ones', () => {
    expect(resolveSelectHighlight(base({ value: 'Steak' }), 'selected')).toBe('steak');
    expect(resolveSelectHighlight(base(), 'selected')).toBe('cake');
    expect(resolveSelectHighlight(base({ value: 'Pizza' }), 'selected')).toBe('cake');
    expect(resolveSelectHighlight(base(), 'first')).toBe('cake');
    expect(resolveSelectHighlight(base(), 'last')).toBe('steak');
    expect(resolveSelectHighlight(base(), { key: 'pizza' })).toBe('pizza');
    expect(resolveSelectHighlight(base({ items: [] }), 'selected')).toBeNull();
  });

  it('does not read the highlight', () => {
    expect(resolveSelectHighlight(base({ highlighted: 'steak' }), 'selected')).toBe('cake');
  });
});
