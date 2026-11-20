import { StrictMode, type ReactElement } from 'react';
import { defineThemeConfig, type ThemeConfig } from '@cocokits/shared';

/** A small theme config with the three Badge options of the cocokits theme, and a container with none. */
export const testThemeConfig: ThemeConfig = defineThemeConfig({
  name: 'test',
  components: {
    badge: {
      variant: { attrName: 'variant', values: ['rounded', 'rectangle'], default: 'rounded' },
      color: { attrName: 'cck-color', values: ['brand', 'contrast'], default: 'contrast' },
      size: { attrName: 'size', values: ['sm', 'md'], default: 'md' },
    },
    'badge-container': {},
  },
});

export function strict(ui: ReactElement): ReactElement {
  return <StrictMode>{ui}</StrictMode>;
}
