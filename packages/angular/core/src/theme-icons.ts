import { inject } from '@angular/core';
import { resolveThemeIcons, type ThemeIcons } from '@cocokits/shared';
import { CCK_THEME } from './theme-provider';

/**
 * Reads the icons of the provided theme: the icon set and the icon each part shows. Call it once, in an
 * injection context (as `themeAttrs`). It reads `CCK_THEME` without throwing, so a component outside a
 * provider gets empty records.
 *
 * @returns The theme's `icons` and `partIconNames`; both are empty records without a provided theme. The
 *   server render and the first client render give the same result.
 */
export function themeIcons(): ThemeIcons {
  return resolveThemeIcons(inject(CCK_THEME, { optional: true })?.themeConfig);
}
