import { StrictMode, type ReactElement } from 'react';
import { checkIcon, heartFillIcon, heartIcon, type Icon } from '@cocokits/icons';
import { IconProvider, ThemeProvider } from '@cocokits/react-core';
import { defineThemeConfig, type ThemeConfig } from '@cocokits/shared';

/** A theme with the SvgIcon `size` option. */
export const iconThemeConfig: ThemeConfig = defineThemeConfig({
  name: 'test',
  components: {
    'svg-icon': {
      size: { attrName: 'size', values: ['sm', 'lg'], default: 'sm', partNames: ['root'] },
    },
  },
});

/** Icons the tests register, all from the pack. `dots` holds two shapes in one body. */
export const testIcons: Readonly<Record<string, Icon>> = {
  heart: heartIcon,
  'heart-fill': heartFillIcon,
  dots: { viewBox: '0 0 10 10', body: `${checkIcon.body}${heartIcon.body}` },
};

/** An `<svg>` string built from a pack icon. */
export const svgOf = (icon: Icon): string => `<svg viewBox="${icon.viewBox}">${icon.body}</svg>`;

/** The element inside the test theme and a provider of {@link testIcons}. */
export const themed = (ui: ReactElement): ReactElement => (
  <ThemeProvider themeConfig={iconThemeConfig}>
    <IconProvider icons={testIcons}>{ui}</IconProvider>
  </ThemeProvider>
);

/** The element inside StrictMode and the test theme. */
export const strictThemed = (ui: ReactElement): ReactElement => <StrictMode>{themed(ui)}</StrictMode>;
