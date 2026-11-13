import { defineThemeConfig, type SvgIconSet, type ThemeConfig } from '@cocokits/shared';

export { mountView, view } from '../../internal/tests/mount-helpers';

/** A small icon set: a two-path icon with the optional rules, and a plain one. */
export const testIcons: SvgIconSet = {
  heart: { viewBox: '0 0 24 24', paths: [{ d: 'M1 1h2' }, { d: 'M3 3h2', fillRule: 'evenodd', clipRule: 'nonzero' }] },
  plus: { viewBox: '0 0 16 16', paths: [{ d: 'M8 0v16' }] },
};

/** A theme with the test icons and the two SvgIcon options. */
export const iconsThemeConfig: ThemeConfig = defineThemeConfig({
  name: 'test',
  components: {
    'svg-icon': {
      size: { attrName: 'size', values: ['sm', 'lg'], default: null },
      rtlMirror: { attrName: 'rtl-mirror', values: [true], default: false },
    },
  },
  icons: testIcons,
});
