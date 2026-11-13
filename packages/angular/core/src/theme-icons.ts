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

/**
 * The icon the provided theme gives a part that holds an icon (`partIconNames[block][part]`). Call it once, in an
 * injection context. The block is read from the anatomy, never written as a literal.
 *
 * @param anatomy - The anatomy of the component; its block names the component in `partIconNames`.
 * @param part - The name of the part.
 * @returns The icon name, or `undefined` when there is no theme or the theme names no icon for the part.
 * @internal
 */
export function themePartIcon(anatomy: { readonly block: string }, part: string): string | undefined {
  // The records are indexed by any name at run time: an own key only, so `constructor` is no icon.
  const byBlock: Partial<Record<string, Readonly<Record<string, string>>>> = themeIcons().partIconNames;
  const parts = Object.hasOwn(byBlock, anatomy.block) ? byBlock[anatomy.block] : undefined;
  return parts !== undefined && Object.hasOwn(parts, part) ? parts[part] : undefined;
}
