import type { ThemeIcons } from './svg-icon';
import type { ThemeConfig } from './theme-config';

/**
 * Reads the icons of a theme. Pure: no input is mutated.
 *
 * @param themeConfig - The provided theme, or `undefined` when no theme is provided.
 * @returns The theme's `icons` and `partIconNames`; an empty record for each one the theme or the field lacks.
 */
export function resolveThemeIcons(themeConfig?: ThemeConfig): ThemeIcons {
  return { icons: themeConfig?.icons ?? {}, partIconNames: themeConfig?.partIconNames ?? {} };
}
