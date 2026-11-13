import { describe, expect, it } from 'vitest';
import { defineThemeConfig, resolveThemeIcons } from '../src/index';
import type { PartIconNames, SvgIconSet, ThemeConfig } from '../src/index';

const icons = {
  check: { viewBox: '0 0 24 24', paths: [{ d: 'M1 1', fillRule: 'evenodd' }] },
} as const satisfies SvgIconSet;
const partIconNames = { select: { optionIndicator: 'check' } } as const satisfies PartIconNames;
const base = { name: 'test', components: {} } as const;

describe('resolveThemeIcons', () => {
  it.each([
    ['no theme', undefined, { icons: {}, partIconNames: {} }],
    ['a theme with neither field', base, { icons: {}, partIconNames: {} }],
    ['a theme with icons only', { ...base, icons }, { icons, partIconNames: {} }],
    ['a theme with part icon names only', { ...base, partIconNames }, { icons: {}, partIconNames }],
    ['a theme with both', { ...base, icons, partIconNames }, { icons, partIconNames }],
  ] as const)('%s', (_name, themeConfig, expected) => {
    expect(resolveThemeIcons(themeConfig as ThemeConfig | undefined)).toEqual(expected);
  });

  it('returns the fields of the theme itself and mutates nothing', () => {
    const themeConfig = defineThemeConfig({ ...base, icons, partIconNames });
    const frozen = JSON.stringify(themeConfig);
    const result = resolveThemeIcons(themeConfig);
    expect(result.icons).toBe(icons);
    expect(result.partIconNames).toBe(partIconNames);
    expect(JSON.stringify(themeConfig)).toBe(frozen);
  });

  it('gives a new record of empty fields for each call without a theme', () => {
    expect(resolveThemeIcons()).not.toBe(resolveThemeIcons());
  });
});
