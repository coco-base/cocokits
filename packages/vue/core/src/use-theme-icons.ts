import { computed, inject, type ComputedRef } from 'vue';
import { resolveThemeIcons, type ThemeIcons } from '@cocokits/shared';
import { THEME_KEY } from './theme-context';

/**
 * Reads the icons of the provided theme: the icon set and the icon each part shows. Call it in `setup`. It reads
 * the theme provider's getter, so a changed provider prop reaches the parts.
 *
 * @returns A computed with the theme's `icons` and `partIconNames`; both are empty records without a provider.
 *   The server render and the first client render give the same result. Never throws.
 */
export function useThemeIcons(): ComputedRef<ThemeIcons> {
  const theme = inject(THEME_KEY, undefined);
  return computed(() => resolveThemeIcons(theme?.().themeConfig));
}
