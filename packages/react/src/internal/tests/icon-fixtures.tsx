import { StrictMode, type ReactElement } from 'react';
import { ThemeProvider } from '@cocokits/react-core';
import { defineThemeConfig, type ThemeConfig } from '@cocokits/shared';

/** A theme with three icons: one path with both rules, two plain paths, and one whose path data holds markup. */
export const iconThemeConfig: ThemeConfig = defineThemeConfig({
  name: 'test',
  components: {
    'svg-icon': {
      size: { attrName: 'size', values: ['sm', 'lg'], default: 'sm', partNames: ['root'] },
    },
  },
  icons: {
    star: {
      viewBox: '0 0 24 24',
      paths: [{ d: 'M12 2l3 7h7l-5 5 2 8-7-4-7 4 2-8-5-5h7z', fillRule: 'evenodd', clipRule: 'nonzero' }],
    },
    dots: { viewBox: '0 0 10 10', paths: [{ d: 'M1 1h2' }, { d: 'M5 5h2' }] },
    // Path data that tries to close the attribute and add an element.
    evil: { viewBox: '0 0 24 24', paths: [{ d: '"/><script>alert(1)</script><path d="' }] },
  },
});

/** The element inside the test theme. */
export const themed = (ui: ReactElement): ReactElement => (
  <ThemeProvider themeConfig={iconThemeConfig}>{ui}</ThemeProvider>
);

/** The element inside StrictMode and the test theme. */
export const strictThemed = (ui: ReactElement): ReactElement => <StrictMode>{themed(ui)}</StrictMode>;
