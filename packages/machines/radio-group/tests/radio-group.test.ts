import { describe, expect, it, vi } from 'vitest';
import {
  getRadioGroupProps,
  radioGroupAnatomy,
  radioGroupKeymap,
  radioGroupMeta,
  transitionRadioGroup,
  type RadioGroupEvent,
  type RadioGroupItem,
  type RadioGroupState,
} from '../index';

const a: RadioGroupItem = { value: 'a' };
const c: RadioGroupItem = { value: 'c' };
const items: RadioGroupItem[] = [a, { value: 'b', disabled: true }, c, { value: 'd' }];

const base = (over: Partial<RadioGroupState> = {}): RadioGroupState => ({
  name: 'plan',
  items,
  mounted: true,
  ...over,
});

interface KeyInit {
  ctrlKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
}

/** A keydown for the node environment, which has no KeyboardEvent. */
function key(keyName: string, init: KeyInit = {}): KeyboardEvent {
  const event = new Event('keydown', { cancelable: true });
  return Object.assign(event, {
    key: keyName,
    isComposing: false,
    ctrlKey: false,
    altKey: false,
    metaKey: false,
    shiftKey: false,
    ...init,
  }) as unknown as KeyboardEvent;
}

function keyOn(state: RadioGroupState, current: string | undefined, keyName: string, init: KeyInit = {}) {
  const send = vi.fn<(event: RadioGroupEvent) => void>();
  const event = key(keyName, init);
  getRadioGroupProps(state, send).root.onKeyDown(event, current);
  return { send, event };
}

function dataKeys(root: object): string[] {
  return Object.entries(root)
    .filter(([name, value]) => name.startsWith('data-') && value !== undefined)
    .map(([name]) => name)
    .sort();
}

describe('anatomy and root', () => {
  it('renders the class, the role and no state for an empty group', () => {
    const { root } = getRadioGroupProps(base(), vi.fn());
    expect(radioGroupAnatomy.classes.root).toBe('cck-radio-group');
    expect(root).toMatchObject({ class: 'cck-radio-group', role: 'radiogroup' });
    expect(root['aria-required']).toBeUndefined();
    expect(root['aria-disabled']).toBeUndefined();
    expect(root['aria-orientation']).toBeUndefined();
    expect(dataKeys(root)).toEqual([]);
  });

  it('renders ARIA and data attributes only while the state holds', () => {
    const { root } = getRadioGroupProps(base({ disabled: true, required: true, orientation: 'vertical' }), vi.fn());
    expect(root['aria-required']).toBe('true');
    expect(root['aria-disabled']).toBe('true');
    expect(root['aria-orientation']).toBe('vertical');
    expect(root['data-orientation']).toBe('vertical');
    expect(dataKeys(root)).toEqual([...radioGroupMeta.dataAttrs.root].sort());
  });

  it('declares the data attributes, the role, the APG link and the default element in the meta', () => {
    expect(radioGroupMeta.dataAttrs.root).toEqual(['data-disabled', 'data-required', 'data-orientation']);
    expect(radioGroupMeta.roles.root).toBe('radiogroup');
    expect(radioGroupMeta.apg).toBe('https://www.w3.org/WAI/ARIA/apg/patterns/radio/');
    expect(radioGroupMeta.defaultElements?.root).toBe('div');
  });

  it('has a meta keyboard row for every keymap row and handles no Home, End or Page key', () => {
    const rows = radioGroupMeta.keyboard.map((row) => row.key);
    for (const binding of radioGroupKeymap) expect(rows).toContain(binding.row);
    const handled = radioGroupKeymap.flatMap((binding) => binding.keys);
    for (const name of ['Home', 'End', 'PageUp', 'PageDown']) expect(handled).not.toContain(name);
  });
});

describe('radio facts', () => {
  it('checks the radio whose value equals the group value', () => {
    const parts = getRadioGroupProps(base({ value: 'c' }), vi.fn());
    expect(parts.radio(a).checked).toBe(false);
    expect(parts.radio(c).checked).toBe(true);
  });

  it('checks nothing for a null value, for a value no radio has, and for a radio without a value', () => {
    for (const value of [null, undefined, 'zzz'] as const) {
      const parts = getRadioGroupProps(base({ value }), vi.fn());
      expect(items.some((item) => parts.radio(item).checked)).toBe(false);
    }
    expect(getRadioGroupProps(base({ value: null }), vi.fn()).radio({}).checked).toBe(false);
  });

  it('gives the group name, an empty name being none', () => {
    expect(getRadioGroupProps(base(), vi.fn()).radio(a).name).toBe('plan');
    expect(getRadioGroupProps(base({ name: '' }), vi.fn()).radio(a).name).toBeUndefined();
  });

  it('ORs disabled and required of the group and the radio', () => {
    const own = getRadioGroupProps(base(), vi.fn());
    expect(own.radio({ value: 'x' }).disabled).toBeUndefined();
    expect(own.radio({ value: 'x', disabled: true }).disabled).toBe(true);
    expect(own.radio({ value: 'x', required: true }).required).toBe(true);
    const group = getRadioGroupProps(base({ disabled: true, required: true }), vi.fn());
    expect(group.radio({ value: 'x' })).toMatchObject({ disabled: true, required: true });
  });

  it("takes the radio's form, else the group's", () => {
    const parts = getRadioGroupProps(base({ form: 'outer' }), vi.fn());
    expect(parts.radio({ value: 'x' }).form).toBe('outer');
    expect(parts.radio({ value: 'x', form: 'own' }).form).toBe('own');
    expect(getRadioGroupProps(base(), vi.fn()).radio({ value: 'x' }).form).toBeUndefined();
  });
});

describe('roving tab stop', () => {
  const stops = (state: RadioGroupState) => {
    const parts = getRadioGroupProps(state, vi.fn());
    return state.items.map((item) => parts.radio(item).tabIndex);
  };

  it('renders no tabindex before mount', () => {
    expect(stops(base({ mounted: false, value: 'c' }))).toEqual([undefined, undefined, undefined, undefined]);
  });

  it('puts the stop on the checked enabled radio', () => {
    expect(stops(base({ value: 'd' }))).toEqual([-1, -1, -1, 0]);
  });

  it('puts the stop on the first enabled radio when none is checked', () => {
    expect(stops(base({ value: null }))).toEqual([0, -1, -1, -1]);
    expect(stops(base({ value: 'zzz' }))).toEqual([0, -1, -1, -1]);
  });

  it('skips a disabled first radio and a checked radio that is disabled', () => {
    expect(stops(base({ items: [{ value: 'a', disabled: true }, { value: 'b' }], value: null }))).toEqual([-1, 0]);
    expect(stops(base({ value: 'b' }))).toEqual([0, -1, -1, -1]);
  });

  it('follows the value', () => {
    expect(stops(base({ value: 'a' }))).toEqual([0, -1, -1, -1]);
    expect(stops(base({ value: 'c' }))).toEqual([-1, -1, 0, -1]);
  });

  it('is revalidated from the registered items (reorder, add, remove)', () => {
    expect(stops(base({ items: [c, a], value: null }))).toEqual([0, -1]);
    expect(stops(base({ items: [{ value: 'n' }, ...items], value: null }))).toEqual([0, -1, -1, -1, -1]);
    expect(stops(base({ items: [], value: null }))).toEqual([]);
  });

  it('has no stop in a disabled group or when every radio is disabled', () => {
    expect(stops(base({ disabled: true, value: 'a' }))).toEqual([-1, -1, -1, -1]);
    expect(stops(base({ items: [{ value: 'a', disabled: true }] }))).toEqual([-1]);
  });

  it('never makes a radio without a value the stop', () => {
    expect(stops(base({ items: [{}, { value: 'b' }], value: null }))).toEqual([-1, 0]);
  });
});

describe('keys', () => {
  it('moves to the next enabled radio on ArrowDown and ArrowRight, skipping the disabled one', () => {
    for (const name of ['ArrowDown', 'ArrowRight']) {
      const { send, event } = keyOn(base(), 'a', name);
      expect(send).toHaveBeenCalledWith({ type: 'RADIO.NAVIGATE', value: 'c', event });
      expect(event.defaultPrevented).toBe(true);
    }
  });

  it('moves to the previous enabled radio on ArrowUp and ArrowLeft', () => {
    for (const name of ['ArrowUp', 'ArrowLeft']) {
      const { send, event } = keyOn(base(), 'c', name);
      expect(send).toHaveBeenCalledWith({ type: 'RADIO.NAVIGATE', value: 'a', event });
    }
  });

  it('wraps by default', () => {
    expect(keyOn(base(), 'd', 'ArrowDown').send).toHaveBeenCalledWith(expect.objectContaining({ value: 'a' }));
    expect(keyOn(base(), 'a', 'ArrowUp').send).toHaveBeenCalledWith(expect.objectContaining({ value: 'd' }));
  });

  it('does nothing at the end without loop, and still prevents the browser move', () => {
    const end = keyOn(base({ loop: false }), 'd', 'ArrowDown');
    expect(end.send).not.toHaveBeenCalled();
    expect(end.event.defaultPrevented).toBe(true);
    const start = keyOn(base({ loop: false }), 'a', 'ArrowLeft');
    expect(start.send).not.toHaveBeenCalled();
    expect(start.event.defaultPrevented).toBe(true);
  });

  it('still moves inside a non-looping group', () => {
    expect(keyOn(base({ loop: false }), 'a', 'ArrowDown').send).toHaveBeenCalledWith(
      expect.objectContaining({ value: 'c' }),
    );
  });

  it('with a vertical orientation moves on Up and Down only; Left and Right do nothing but are prevented', () => {
    const state = base({ orientation: 'vertical' });
    expect(keyOn(state, 'a', 'ArrowDown').send).toHaveBeenCalledWith(expect.objectContaining({ value: 'c' }));
    for (const name of ['ArrowLeft', 'ArrowRight']) {
      const { send, event } = keyOn(state, 'a', name);
      expect(send).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(true);
    }
  });

  it('with a horizontal orientation moves on Left and Right only; Up and Down do nothing but are prevented', () => {
    const state = base({ orientation: 'horizontal' });
    expect(keyOn(state, 'a', 'ArrowRight').send).toHaveBeenCalledWith(expect.objectContaining({ value: 'c' }));
    for (const name of ['ArrowUp', 'ArrowDown']) {
      const { send, event } = keyOn(state, 'a', name);
      expect(send).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(true);
    }
  });

  it('swaps Left and Right in rtl and never Up and Down', () => {
    const rtl = base({ dir: 'rtl' });
    expect(keyOn(rtl, 'a', 'ArrowLeft').send).toHaveBeenCalledWith(expect.objectContaining({ value: 'c' }));
    expect(keyOn(rtl, 'c', 'ArrowRight').send).toHaveBeenCalledWith(expect.objectContaining({ value: 'a' }));
    expect(keyOn(rtl, 'a', 'ArrowDown').send).toHaveBeenCalledWith(expect.objectContaining({ value: 'c' }));
    expect(keyOn(rtl, 'c', 'ArrowUp').send).toHaveBeenCalledWith(expect.objectContaining({ value: 'a' }));
  });

  it('does not handle Home, End, PageUp, PageDown, Enter, Space or Tab', () => {
    for (const name of ['Home', 'End', 'PageUp', 'PageDown', 'Enter', ' ', 'Tab']) {
      const { send, event } = keyOn(base(), 'a', name);
      expect(send).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(false);
    }
  });

  it('leaves arrows with Ctrl, Alt or Meta to the browser, but handles Shift', () => {
    for (const init of [{ ctrlKey: true }, { altKey: true }, { metaKey: true }]) {
      const { send, event } = keyOn(base(), 'a', 'ArrowDown', init);
      expect(send).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(false);
    }
    expect(keyOn(base(), 'a', 'ArrowDown', { shiftKey: true }).send).toHaveBeenCalled();
  });

  it('ignores an event another handler prevented, and one during composition', () => {
    const send = vi.fn();
    const prevented = key('ArrowDown');
    prevented.preventDefault();
    getRadioGroupProps(base(), send).root.onKeyDown(prevented, 'a');
    const composing = Object.assign(key('ArrowDown'), { isComposing: true });
    getRadioGroupProps(base(), send).root.onKeyDown(composing, 'a');
    expect(send).not.toHaveBeenCalled();
  });

  it('ignores a key whose focused radio is unknown', () => {
    const { send, event } = keyOn(base(), undefined, 'ArrowDown');
    expect(send).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });

  it('does nothing when every other radio is disabled', () => {
    const state = base({ items: [{ value: 'a' }, { value: 'b', disabled: true }] });
    expect(keyOn(state, 'a', 'ArrowDown').send).not.toHaveBeenCalled();
  });

  it('does nothing in a disabled group', () => {
    const { send, event } = keyOn(base({ disabled: true }), 'a', 'ArrowDown');
    expect(send).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });

  it('skips radios without a value', () => {
    const state = base({ items: [{ value: 'a' }, {}, { value: 'c' }] });
    expect(keyOn(state, 'a', 'ArrowDown').send).toHaveBeenCalledWith(expect.objectContaining({ value: 'c' }));
  });
});

describe('transitionRadioGroup', () => {
  const event = new Event('keydown');

  it('focuses and activates a radio that is not checked', () => {
    expect(transitionRadioGroup(base({ value: 'a' }), { type: 'RADIO.NAVIGATE', value: 'c', event })).toEqual({
      focus: 'c',
      activate: 'c',
    });
  });

  it('only focuses a radio that is already checked', () => {
    expect(transitionRadioGroup(base({ value: 'c' }), { type: 'RADIO.NAVIGATE', value: 'c', event })).toEqual({
      focus: 'c',
    });
  });

  it('does nothing for a disabled or unknown target', () => {
    expect(transitionRadioGroup(base(), { type: 'RADIO.NAVIGATE', value: 'b', event })).toEqual({});
    expect(transitionRadioGroup(base(), { type: 'RADIO.NAVIGATE', value: 'zzz', event })).toEqual({});
  });
});
