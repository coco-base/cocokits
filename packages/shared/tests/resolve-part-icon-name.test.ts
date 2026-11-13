import { describe, expect, it } from 'vitest';
import { resolvePartIconName } from '../src/index';
import type { PartIconNames } from '../src/index';

const names = { select: { optionIndicator: 'check' } } as const satisfies PartIconNames;

describe('resolvePartIconName', () => {
  it('gives the icon name of a part', () => {
    expect(resolvePartIconName(names, 'select', 'optionIndicator')).toBe('check');
  });

  it.each([
    ['an empty record', {}, 'select', 'optionIndicator'],
    ['an unknown block', names, 'accordion', 'optionIndicator'],
    ['an unknown part', names, 'select', 'dropdownIcon'],
    ['a prototype block', names, 'constructor', 'name'],
    ['a prototype part', names, 'select', 'constructor'],
    ['a __proto__ part', names, 'select', '__proto__'],
    ['a prototype block and part', names, 'toString', 'toString'],
  ] as const)('gives undefined for %s', (_name, record, block, part) => {
    expect(resolvePartIconName(record as PartIconNames, block, part)).toBeUndefined();
  });

  it('does not change the input', () => {
    const input = { select: { optionIndicator: 'check' } };
    resolvePartIconName(input, 'select', 'optionIndicator');
    expect(input).toEqual({ select: { optionIndicator: 'check' } });
  });
});
