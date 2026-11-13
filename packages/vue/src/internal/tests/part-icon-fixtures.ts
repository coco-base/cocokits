import { h, type VNode } from 'vue';
import { defineThemeConfig, type ThemeConfig } from '@cocokits/shared';
import { ThemeProvider } from '@cocokits/vue-core';

/** A theme that names an icon for the icon-holding parts of the Select, the Accordion and the Checkbox. */
export const partIconsThemeConfig: ThemeConfig = defineThemeConfig({
  name: 'test',
  components: {},
  icons: {
    'chevron-down': { viewBox: '0 0 24 24', paths: [{ d: 'M6 9l6 6 6-6' }] },
    check: { viewBox: '0 0 24 24', paths: [{ d: 'M5 12l5 5 9-9' }] },
  },
  partIconNames: {
    select: { dropdownIcon: 'chevron-down', optionIndicator: 'check' },
    accordion: { indicator: 'chevron-down' },
    checkbox: { background: 'check' },
  },
});

/** The same theme without any part icon names. */
export const noPartIconsThemeConfig: ThemeConfig = defineThemeConfig({
  name: 'bare',
  components: {},
  icons: partIconsThemeConfig.icons ?? {},
});

/** Wraps a render function in the provider of the theme that has part icons. */
export const themed =
  (render: () => VNode | VNode[], themeConfig: ThemeConfig = partIconsThemeConfig) =>
  (): VNode =>
    h(ThemeProvider, { themeConfig }, render);

/** The names of the icons a part holds, in order. */
export const iconNamesIn = (part: Element | null): string[] =>
  [...(part?.querySelectorAll('.cck-svg-icon') ?? [])].map((icon) => icon.getAttribute('data-icon-name') ?? '');
