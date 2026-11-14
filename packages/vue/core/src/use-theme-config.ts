import { computed, inject, type ComputedRef } from 'vue';
import type { ThemeConfig } from '@cocokits/shared';
import { THEME_KEY } from './theme-context';

/**
 * Reads the theme config of the nearest `ThemeProvider`, for example to find the icon a theme names for a part in
 * `components.<name>.icons`. Call it in `setup`. It reads the provider's getter, so a changed provider prop reaches
 * the parts.
 *
 * @example
 * const themeConfig = useThemeConfig();
 * const icon = computed(() => themeConfig.value?.components['select']?.icons?.['dropdownIcon']);
 * @returns A computed with the provided config, or `undefined` without a provider. The server render and the
 *   first client render give the same result. Never throws.
 */
export function useThemeConfig(): ComputedRef<ThemeConfig | undefined> {
  const theme = inject(THEME_KEY, undefined);
  return computed(() => theme?.().themeConfig);
}
