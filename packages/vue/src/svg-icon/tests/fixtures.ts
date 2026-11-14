import { h, type Component, type VNode } from 'vue';
import { checkIcon, heartIcon, plusIcon, type Icon } from '@cocokits/icons';
import { defineThemeConfig, type ThemeConfig } from '@cocokits/shared';
import { IconProvider, ThemeProvider } from '@cocokits/vue-core';

export { mountView, view } from '../../internal/tests/mount-helpers';

/** Registered by name in the tests: a two-icon set from the pack. */
export const testIcons: Readonly<Record<string, Icon>> = { heart: heartIcon, plus: plusIcon };

/** A full SVG string built from a pack icon. */
export const svgOf = (icon: Icon): string => `<svg viewBox="${icon.viewBox}">${icon.body}</svg>`;

export { checkIcon, heartIcon, plusIcon };

/** A theme with the two SvgIcon options. */
export const iconsThemeConfig: ThemeConfig = defineThemeConfig({
  name: 'test',
  components: {
    'svg-icon': {
      size: { attrName: 'size', values: ['sm', 'lg'], default: null },
      rtlMirror: { attrName: 'rtl-mirror', values: [true], default: false },
    },
  },
});

/** Wraps nodes in an icon provider with the test icons and the test theme. */
export const withIcons = (
  child: () => VNode | VNode[],
  icons: Readonly<Record<string, Icon>> = testIcons,
): Component => ({
  render: () => h(IconProvider, { icons }, () => h(ThemeProvider, { themeConfig: iconsThemeConfig }, child)),
});
