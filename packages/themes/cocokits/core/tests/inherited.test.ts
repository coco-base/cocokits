import { describe, expect, it } from 'vitest';
import { inherited } from '../src/index';

describe('inherited', () => {
  it.each([
    ['its own value wins', ['lg', 'sm', 'md'], 'lg'],
    ['undefined falls through to the nearest parent', [undefined, 'sm', 'md'], 'sm'],
    ['undefined falls through to the next parent', [undefined, undefined, 'md'], 'md'],
    ['null removes and stops the search', [null, 'sm', 'md'], null],
    ['a parent null stops the search', [undefined, null, 'md'], null],
    ['nothing set gives undefined', [undefined, undefined], undefined],
  ] as const)('%s', (_name, [own, ...parents], expected) => {
    expect(inherited<string | null>(own, ...parents)).toBe(expected);
  });
});
