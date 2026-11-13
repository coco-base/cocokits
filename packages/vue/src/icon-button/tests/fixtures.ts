import { defineThemeConfig, type ThemeConfig } from '@cocokits/shared';

export { linkForms, makeLink } from '../../internal/tests/link-forms';
export { mountView, view } from '../../internal/tests/mount-helpers';

/** A small theme with the four IconButton options of the cocokits theme, and one icon. */
export const iconThemeConfig: ThemeConfig = defineThemeConfig({
  name: 'test',
  components: {
    'icon-button': {
      variant: { attrName: 'variant', values: ['primary', 'ghost'], default: 'primary' },
      color: { attrName: 'cck-color', values: ['brand', 'danger'], default: 'brand' },
      size: { attrName: 'size', values: ['sm', 'md'], default: 'md' },
    },
  },
  icons: { plus: { viewBox: '0 0 16 16', paths: [{ d: 'M8 0v16' }] } },
});
