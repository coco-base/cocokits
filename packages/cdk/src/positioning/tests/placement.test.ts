import { describe, expect, it } from 'vitest';
import { toFloatingPlacement } from '../index';
import { fromFloatingPlacement } from '../placement';

describe('toFloatingPlacement', () => {
  it.each([
    { side: 'top', align: 'center', dir: 'ltr', expected: 'top' },
    { side: 'bottom', align: 'start', dir: 'ltr', expected: 'bottom-start' },
    { side: 'bottom', align: 'end', dir: 'rtl', expected: 'bottom-end' },
    { side: 'start', align: 'center', dir: 'ltr', expected: 'left' },
    { side: 'start', align: 'center', dir: 'rtl', expected: 'right' },
    { side: 'end', align: 'start', dir: 'ltr', expected: 'right-start' },
    { side: 'end', align: 'end', dir: 'rtl', expected: 'left-end' },
  ] as const)('maps $side/$align in $dir to $expected', ({ side, align, dir, expected }) => {
    expect(toFloatingPlacement(side, align, dir)).toBe(expected);
  });
});

describe('fromFloatingPlacement', () => {
  it.each([
    { placement: 'top', dir: 'ltr', expected: { side: 'top', align: 'center' } },
    { placement: 'bottom-end', dir: 'rtl', expected: { side: 'bottom', align: 'end' } },
    { placement: 'left', dir: 'ltr', expected: { side: 'start', align: 'center' } },
    { placement: 'left', dir: 'rtl', expected: { side: 'end', align: 'center' } },
    { placement: 'right-start', dir: 'ltr', expected: { side: 'end', align: 'start' } },
    { placement: 'right-start', dir: 'rtl', expected: { side: 'start', align: 'start' } },
  ] as const)('reads $placement in $dir as $expected', ({ placement, dir, expected }) => {
    expect(fromFloatingPlacement(placement, dir)).toEqual(expected);
  });

  it.each(['ltr', 'rtl'] as const)('inverts toFloatingPlacement in %s', (dir) => {
    for (const side of ['top', 'bottom', 'start', 'end'] as const) {
      for (const align of ['start', 'center', 'end'] as const) {
        expect(fromFloatingPlacement(toFloatingPlacement(side, align, dir), dir)).toEqual({ side, align });
      }
    }
  });
});
