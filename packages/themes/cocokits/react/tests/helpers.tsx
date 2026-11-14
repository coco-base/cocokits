import { IconProvider, ThemeProvider } from '@cocokits/react-core';
import * as pack from '@cocokits/icons';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { StrictMode, type ReactElement } from 'react';
import { renderToString } from 'react-dom/server';

/** The icons of `@cocokits/icons` by name: the exports that end in `Icon`, in kebab case. */
export const packIcons: Readonly<Record<string, pack.Icon>> = Object.fromEntries(
  Object.entries(pack)
    .filter(([name]) => name.endsWith('Icon'))
    .map(([name, icon]) => [
      name.slice(0, -'Icon'.length).replaceAll(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`),
      icon as pack.Icon,
    ]),
);

const withTheme = (ui: ReactElement): ReactElement => (
  <ThemeProvider themeConfig={cocokitsThemeConfig}>
    <IconProvider icons={packIcons}>{ui}</IconProvider>
  </ThemeProvider>
);

/** The server markup of the element inside the cocokits theme and the registered pack. */
export const html = (ui: ReactElement): string => renderToString(withTheme(ui));

/** The element inside StrictMode, the cocokits theme and the registered pack. */
export const themed = (ui: ReactElement): ReactElement => <StrictMode>{withTheme(ui)}</StrictMode>;
