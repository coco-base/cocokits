import { ThemeProvider } from '@cocokits/react-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { StrictMode, type ReactElement } from 'react';
import { renderToString } from 'react-dom/server';

/** The server markup of the element inside the cocokits theme. */
export const html = (ui: ReactElement): string =>
  renderToString(<ThemeProvider themeConfig={cocokitsThemeConfig}>{ui}</ThemeProvider>);

/** The element inside StrictMode and the cocokits theme. */
export const themed = (ui: ReactElement): ReactElement => (
  <StrictMode>
    <ThemeProvider themeConfig={cocokitsThemeConfig}>{ui}</ThemeProvider>
  </StrictMode>
);
