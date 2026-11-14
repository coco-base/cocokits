import { describe, expect, it, vi } from 'vitest';
import { handleHiddenInputInvalid, hiddenInputEntries } from '../index';

describe('hiddenInputEntries', () => {
  it.each([
    { name: 'no name', formInput: { values: ['a'] }, list: true, expected: [] },
    { name: 'a single control', formInput: { name: 'n', values: ['a'] }, list: false, expected: ['a'] },
    {
      name: 'a single required empty control',
      formInput: { name: 'n', required: true, values: [] },
      list: false,
      expected: [],
    },
    { name: 'a list', formInput: { name: 'n', values: ['a', 'b'] }, list: true, expected: ['a', 'b'] },
    { name: 'an empty list', formInput: { name: 'n', values: [] }, list: true, expected: [] },
    { name: 'a required empty list', formInput: { name: 'n', required: true, values: [] }, list: true, expected: [''] },
  ] as const)('gives $expected for $name', ({ formInput, list, expected }) => {
    expect(hiddenInputEntries({ ...formInput, values: [...formInput.values] }, list)).toEqual(expected);
  });
});

describe('handleHiddenInputInvalid', () => {
  it('focuses now and in the next task, and returns the message without canceling', async () => {
    const input = document.createElement('input');
    input.required = true;
    const event = new Event('invalid', { cancelable: true });
    input.dispatchEvent(event);
    const focus = vi.fn();
    expect(handleHiddenInputInvalid(event, focus)).toBe(input.validationMessage);
    expect(focus).toHaveBeenCalledTimes(1);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(focus).toHaveBeenCalledTimes(2);
    expect(event.defaultPrevented).toBe(false);
  });
});
