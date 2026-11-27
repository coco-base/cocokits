'use client';

import { useContext } from 'react';
import type { ThemeConfig } from '@cocokits/shared';
import { ThemeContext } from './theme-context';

/**
 * Reads the theme config of the nearest `ThemeProvider`. Parts that need a fact of the theme call it, for example
 * the icon a part shows in `components.<name>.icons`.
 *
 * @returns The provided config, or `undefined` without a provider. The server render and the first client render
 *   give the same result. Never throws, and nothing is mutated.
 */
export function useThemeConfig(): ThemeConfig | undefined {
  return useContext(ThemeContext)?.themeConfig;
}
