import { defineThemeConfig, type ThemeConfig } from '@cocokits/shared';

/** A small theme config with the two Divider options of the cocokits theme. */
export const testThemeConfig: ThemeConfig = defineThemeConfig({
  name: 'test',
  components: {
    divider: {
      size: { attrName: 'size', values: ['md', 'lg'], default: 'md' },
      color: { attrName: 'color', values: ['light', 'default', 'dark'], default: 'default' },
    },
  },
});

export { mountView, pick, view } from '../../internal/tests/mount-helpers';
