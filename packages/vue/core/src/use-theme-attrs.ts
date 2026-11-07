import { computed, inject, type ComputedRef } from 'vue';
import { resolveThemeAttrs, type ThemeAttrsByPart, type ThemeConfig } from '@cocokits/shared';
import { THEME_KEY, THEME_OPTIONS_KEY } from './theme-context';

const NO_THEME: ThemeConfig = { name: '', components: {} };

/**
 * Resolves the theme `data-*` attributes of every part of an anatomy in one call, so a component
 * never repeats a part name. Own option values (from the nearest theme wrapper) win over the
 * provider overrides, which win over the config defaults. Pure for the caller: it mutates no
 * input. Call it in `setup` and bind the record of each rendered part, before the anatomy class.
 *
 * @param anatomy - The component anatomy; its block names the component in the `ThemeConfig`.
 * @returns A computed with one attribute record per anatomy part; the records are empty
 *   without a provider, never throws.
 */
export function useThemeAttrs<A extends { readonly block: string; readonly parts: object }>(
  anatomy: A,
): ComputedRef<ThemeAttrsByPart<A>> {
  const theme = inject(THEME_KEY, undefined);
  const themeOptions = inject(THEME_OPTIONS_KEY, undefined);
  return computed(() => {
    const state = theme?.();
    const own = themeOptions?.();
    const ownValues = own?.componentName === anatomy.block ? own.options : undefined;
    return resolveThemeAttrs(state?.themeConfig ?? NO_THEME, anatomy, ownValues, state?.overrides[anatomy.block]);
  });
}
