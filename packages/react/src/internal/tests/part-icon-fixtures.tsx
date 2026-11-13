import type { ReactElement } from 'react';
import { ThemeProvider } from '@cocokits/react-core';
import { defineThemeConfig, type ThemeConfig } from '@cocokits/shared';

/** A theme that names an icon for the parts that hold one: Select, Accordion and Checkbox. */
export const partIconTheme: ThemeConfig = defineThemeConfig({
  name: 'test',
  components: {},
  icons: {
    'chevron-down': { viewBox: '0 0 24 24', paths: [{ d: 'M6 9l6 6 6-6' }] },
    check: { viewBox: '0 0 24 24', paths: [{ d: 'M5 13l4 4L19 7' }] },
    star: { viewBox: '0 0 24 24', paths: [{ d: 'M12 2l3 7h7' }] },
  },
  partIconNames: {
    select: { dropdownIcon: 'chevron-down', optionIndicator: 'check' },
    accordion: { indicator: 'chevron-down' },
    checkbox: { background: 'check' },
  },
});

/** The element inside {@link partIconTheme}. */
export const withPartIcons = (ui: ReactElement): ReactElement => (
  <ThemeProvider themeConfig={partIconTheme}>{ui}</ThemeProvider>
);

/** The names of the icons an element holds, in document order. */
export const iconNamesIn = (element: Element | null): (string | null)[] =>
  [...(element?.querySelectorAll('.cck-svg-icon') ?? [])].map((icon) => icon.getAttribute('data-icon-name'));
