import { h, type VNode } from 'vue';
import { plusIcon } from '@cocokits/icons';
import { defineThemeConfig, type ThemeConfig } from '@cocokits/shared';
import { IconProvider, ThemeProvider } from '@cocokits/vue-core';

export { linkForms, makeLink } from '../../internal/tests/link-forms';
export { mountView, view } from '../../internal/tests/mount-helpers';

/** A small theme with the three IconButton options of the cocokits theme. */
const iconThemeConfig: ThemeConfig = defineThemeConfig({
  name: 'test',
  components: {
    'icon-button': {
      variant: { attrName: 'variant', values: ['primary', 'ghost'], default: 'primary' },
      color: { attrName: 'cck-color', values: ['brand', 'danger'], default: 'brand' },
      size: { attrName: 'size', values: ['sm', 'md'], default: 'md' },
    },
  },
});

/** Renders the children inside the small theme and an icon provider that registers the `plus` icon. */
export const inTheme = (children: () => VNode | VNode[]): VNode =>
  h(IconProvider, { icons: { plus: plusIcon } }, () => h(ThemeProvider, { themeConfig: iconThemeConfig }, children));
