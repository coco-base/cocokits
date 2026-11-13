import type { ReactElement } from 'react';
import { chevronDownIcon, checkIcon, heartIcon, type Icon } from '@cocokits/icons';
import { IconProvider, ThemeProvider } from '@cocokits/react-core';
import { defineThemeConfig, type ThemeConfig } from '@cocokits/shared';

/** A theme that names an icon for the parts that hold one: Select, Accordion and Checkbox. */
export const partIconTheme: ThemeConfig = defineThemeConfig({
  name: 'test',
  components: {
    select: { icons: { dropdownIcon: 'chevron-down', optionIndicator: 'check' } },
    accordion: { icons: { indicator: 'chevron-down' } },
    checkbox: { icons: { background: 'check' } },
  },
});

/** The icons the app registers for {@link partIconTheme}. */
export const partIcons: Readonly<Record<string, Icon>> = {
  'chevron-down': chevronDownIcon,
  check: checkIcon,
  heart: heartIcon,
};

/** The element inside {@link partIconTheme} and a provider of its icons. */
export const withPartIcons = (ui: ReactElement): ReactElement => (
  <ThemeProvider themeConfig={partIconTheme}>
    <IconProvider icons={partIcons}>{ui}</IconProvider>
  </ThemeProvider>
);

/** The names of the icons an element holds, in document order. */
export const iconNamesIn = (element: Element | null): (string | null)[] =>
  [...(element?.querySelectorAll('.cck-svg-icon') ?? [])].map((icon) => icon.getAttribute('data-icon'));
