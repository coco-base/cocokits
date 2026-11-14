import { defineAnatomy, resolveThemeAttrs } from '@cocokits/shared';
import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  chipListSizeDefaultMode,
  chipListSizeModes,
  chipSizeDefaultMode,
  chipSizeModes,
} from '../src/generated/token-modes';
import { cocokitsThemeConfig } from '../src/index';

describe.each(['chip', 'chip-list'] as const)('cocokitsThemeConfig %s', (name) => {
  const anatomy = defineAnatomy({
    block: name,
    parts: { root: { name: 'Root', description: 'The root.' }, input: { name: 'Input', description: 'The input.' } },
  });
  const option = cocokitsThemeConfig.components[name].size;
  const [modes, fallback] =
    name === 'chip' ? [chipSizeModes, chipSizeDefaultMode] : [chipListSizeModes, chipListSizeDefaultMode];

  it('has the size option on the root with sm, md and lg and the default md', () => {
    expect(option.attrName).toBe('size');
    expect(option.partNames).toEqual(['root']);
    expect(option.values).toEqual(['sm', 'md', 'lg']);
    expect(option.default).toBe('md');
  });

  it('takes the size from the generated token modes and types the values', () => {
    expect(option.values).toBe(modes);
    expect(option.default).toBe(fallback);
    expectTypeOf(option.values).toEqualTypeOf<readonly ['sm', 'md', 'lg']>();
  });

  it('renders data-size on the root only, an own option winning and null removing it', () => {
    const attrs = resolveThemeAttrs(cocokitsThemeConfig, anatomy);
    expect(attrs.root).toEqual({ 'data-size': 'md' });
    expect(attrs.input).toEqual({});
    expect(resolveThemeAttrs(cocokitsThemeConfig, anatomy, { size: 'lg' }).root).toEqual({ 'data-size': 'lg' });
    expect(resolveThemeAttrs(cocokitsThemeConfig, anatomy, { size: null }).root).toEqual({});
  });
});

describe('cocokitsThemeConfig chip icons', () => {
  it('names the close icon for the remove button, and the chip list names none', () => {
    expect(cocokitsThemeConfig.components.chip.icons).toEqual({ remove: 'close' });
    expect(cocokitsThemeConfig.components['chip-list']).not.toHaveProperty('icons');
  });
});
