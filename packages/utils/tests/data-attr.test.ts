import { describe, expect, it } from 'vitest';
import { dataAttr } from '../src/index';

describe('dataAttr', () => {
  it.each([
    { input: true, expected: '' },
    { input: false, expected: undefined },
    { input: undefined, expected: undefined },
    { input: null, expected: undefined },
  ])('returns $expected for $input', ({ input, expected }) => {
    expect(dataAttr(input)).toBe(expected);
  });
});
