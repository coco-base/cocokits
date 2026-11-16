import { describe, expect, it } from 'vitest';
import { resolveInheritedValue } from '../src/index';

interface Row {
  readonly name: string;
  readonly ownValue: string | null | undefined;
  readonly parentValues: readonly (string | null | undefined)[];
  readonly expected: string | null | undefined;
}

const rows: Row[] = [
  { name: 'its own value wins', ownValue: 'lg', parentValues: ['sm', 'md'], expected: 'lg' },
  {
    name: 'undefined falls through to the nearest parent',
    ownValue: undefined,
    parentValues: ['sm', 'md'],
    expected: 'sm',
  },
  {
    name: 'undefined falls through to the next parent',
    ownValue: undefined,
    parentValues: [undefined, 'md'],
    expected: 'md',
  },
  { name: 'null removes and stops the search', ownValue: null, parentValues: ['sm', 'md'], expected: null },
  { name: 'a parent null stops the search', ownValue: undefined, parentValues: [null, 'md'], expected: null },
  {
    name: 'nothing set gives undefined',
    ownValue: undefined,
    parentValues: [undefined, undefined],
    expected: undefined,
  },
];

describe('resolveInheritedValue', () => {
  it.each(rows)('$name', ({ ownValue, parentValues, expected }) => {
    expect(resolveInheritedValue<string | null>(ownValue, ...parentValues)).toBe(expected);
  });
});
