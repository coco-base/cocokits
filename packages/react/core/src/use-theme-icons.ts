'use client';

import { useContext, useMemo } from 'react';
import { resolveThemeIcons, type ThemeIcons } from '@cocokits/shared';
import { ThemeContext } from './theme-context';

/**
 * Reads the icons of the provided theme: the icon set and the icon each part shows. Components that draw an icon
 * (SvgIcon, and parts such as the Select icon) call it, so they need no second provider.
 *
 * @returns The theme's `icons` and `partIconNames`; both are empty records without a provider. The server render
 *   and the first client render give the same result. Never throws, and no input is mutated.
 */
export function useThemeIcons(): ThemeIcons {
  const themeConfig = useContext(ThemeContext)?.themeConfig;
  return useMemo(() => resolveThemeIcons(themeConfig), [themeConfig]);
}
