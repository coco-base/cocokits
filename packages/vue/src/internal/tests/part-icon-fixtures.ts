import { h, type VNode } from 'vue';
import { arrowDownIcon, arrowUpIcon, heartIcon, plusIcon } from '@cocokits/icons';
import { defineThemeConfig, type ThemeConfig } from '@cocokits/shared';
import { IconProvider, ThemeProvider } from '@cocokits/vue-core';

/** A theme that names the base icons for the icon-holding parts of the Select, the Accordion and the Checkbox. */
export const partIconsThemeConfig: ThemeConfig = defineThemeConfig({
  name: 'test',
  components: {
    select: { icons: { dropdownIcon: 'chevron-down', optionIndicator: 'check' } },
    accordion: { icons: { indicator: 'chevron-down' } },
    checkbox: { icons: { background: 'check' } },
  },
});

/** A theme that names other icons, which {@link customIcons} registers. */
export const customPartIconsThemeConfig: ThemeConfig = defineThemeConfig({
  name: 'custom',
  components: {
    select: { icons: { dropdownIcon: 'arrow-down', optionIndicator: 'plus' } },
    accordion: { icons: { indicator: 'arrow-up' } },
    checkbox: { icons: { background: 'heart' } },
  },
});

/** A theme that names an icon nobody registered for every part. */
export const missingPartIconsThemeConfig: ThemeConfig = defineThemeConfig({
  name: 'missing',
  components: {
    select: { icons: { dropdownIcon: 'nope', optionIndicator: 'nope' } },
    accordion: { icons: { indicator: 'nope' } },
    checkbox: { icons: { background: 'nope' } },
  },
});

/** A theme that names no part icon. */
export const noPartIconsThemeConfig: ThemeConfig = defineThemeConfig({ name: 'bare', components: {} });

/** The icons the custom theme names. */
export const customIcons = { 'arrow-down': arrowDownIcon, 'arrow-up': arrowUpIcon, plus: plusIcon, heart: heartIcon };

/** Wraps a render function in an icon provider and the provider of the theme. */
export const themed =
  (render: () => VNode | VNode[], themeConfig: ThemeConfig = partIconsThemeConfig) =>
  (): VNode =>
    h(IconProvider, { icons: customIcons }, () => h(ThemeProvider, { themeConfig }, render));

/** The names of the icons a part holds, in order. */
export const iconNamesIn = (part: Element | null): string[] =>
  [...(part?.querySelectorAll('.cck-svg-icon') ?? [])].map((icon) => icon.getAttribute('data-icon') ?? '');
