import { cocokitsThemeIcons as coreIcons } from '@cocokits/theme-cocokits';
import { describe, expect, it } from 'vitest';
import { cocokitsThemeIcons } from '../src/index';

describe('theme icons', () => {
  it('re-exports the icons of the framework-free theme, the chip remove icon included', () => {
    expect(cocokitsThemeIcons).toBe(coreIcons);
    expect(Object.keys(cocokitsThemeIcons)).toEqual(['chevron-down', 'check', 'circle-xmark']);
  });
});
