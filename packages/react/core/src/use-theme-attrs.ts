'use client';

import { useContext } from 'react';
import { resolveThemeAttrs, type ThemeAttrsByPart, type ThemeConfig } from '@cocokits/shared';
import { ThemeContext, ThemeOptionsContext } from './theme-context';

const NO_THEME: ThemeConfig = { name: '', components: {} };

/**
 * Resolves the theme `data-*` attributes of every part of an anatomy in one call, so a component
 * never repeats a part name. Own option values (from the nearest theme wrapper) win over the
 * provider overrides, which win over the config defaults. Pure: it mutates no input. Each
 * rendered part spreads its own record before `className`.
 *
 * @param anatomy - The component anatomy; its block names the component in the `ThemeConfig`.
 * @returns One attribute record per anatomy part; empty records without a provider, never throws.
 */
export function useThemeAttrs<A extends { readonly block: string; readonly parts: object }>(
  anatomy: A,
): ThemeAttrsByPart<A> {
  const theme = useContext(ThemeContext);
  const themeOptions = useContext(ThemeOptionsContext);
  const ownValues = themeOptions?.componentName === anatomy.block ? themeOptions.options : undefined;
  return resolveThemeAttrs(theme?.themeConfig ?? NO_THEME, anatomy, ownValues, theme?.overrides[anatomy.block]);
}
