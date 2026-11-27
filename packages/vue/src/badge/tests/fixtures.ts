import { defineThemeConfig, type ThemeConfig } from '@cocokits/shared';

/** A small theme config with the three Badge options of the cocokits theme. */
export const testThemeConfig: ThemeConfig = defineThemeConfig({
  name: 'test',
  components: {
    badge: {
      variant: { attrName: 'variant', values: ['rounded', 'rectangle'], default: 'rounded' },
      color: { attrName: 'cck-color', values: ['brand', 'contrast'], default: 'contrast' },
      size: { attrName: 'size', values: ['sm', 'md'], default: 'md' },
    },
  },
});

export { mountView, pick, view } from '../../internal/tests/mount-helpers';
