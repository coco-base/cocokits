import { describe, expect, it, vi } from 'vitest';
import { getRadioGroupProps, isRadioGroupInvalidShown, type RadioGroupState } from '../index';

const items = [{ value: 'a' }, { value: 'b' }];

const state = (over: Partial<RadioGroupState>): RadioGroupState => ({ name: 'plan', items, mounted: true, ...over });

describe('RadioGroup touched table (radio-10)', () => {
  it.each([
    ['required, touched, no value', { required: true, touched: true }, true],
    ['required, submitted, no value', { required: true, submitted: true }, true],
    ['required, touched, an empty string value', { required: true, touched: true, value: '' }, true],
    ['required, touched, a value before the radios register', { required: true, touched: true, value: 'z' }, false],
    ['required, touched, a null value', { required: true, touched: true, value: null }, true],
    ['required, touched, a value', { required: true, touched: true, value: 'a' }, false],
    ['required, no value, neither touched nor submitted', { required: true }, false],
    ['required, no value, touched false', { required: true, touched: false, submitted: false }, false],
    ['not required, touched, no value', { touched: true }, false],
    ['invalid, touched', { invalid: true, touched: true }, true],
    ['invalid, submitted', { invalid: true, submitted: true }, true],
    ['invalid, neither touched nor submitted', { invalid: true }, false],
    ['invalid, touched, a checked radio', { invalid: true, touched: true, value: 'a' }, true],
    ['touched and submitted, nothing invalid', { touched: true, submitted: true, value: 'a' }, false],
  ] as const)('%s', (_name, over, shown) => {
    const group = state(over);
    const { root } = getRadioGroupProps(group, vi.fn());
    expect(isRadioGroupInvalidShown(group)).toBe(shown);
    expect(root['aria-invalid']).toBe(shown ? 'true' : undefined);
    expect(root['data-invalid']).toBe(shown ? '' : undefined);
  });

  it('never renders aria-invalid="false"', () => {
    expect(JSON.stringify(getRadioGroupProps(state({ touched: true }), vi.fn()).root)).not.toContain('"false"');
  });

  it('reads the value, not the registered radios, so a server render with a value is not invalid', () => {
    const none = getRadioGroupProps({ items: [], required: true, touched: true, value: 'a' }, vi.fn());
    expect(none.root['aria-invalid']).toBeUndefined();
    const empty = getRadioGroupProps({ items: [], required: true, touched: true }, vi.fn());
    expect(empty.root['aria-invalid']).toBe('true');
    expect(empty.root['data-invalid']).toBe('');
  });
});
