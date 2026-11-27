import { StrictMode, type ReactElement } from 'react';
import { defineThemeConfig, type ThemeConfig } from '@cocokits/shared';

/** A small theme config with the four Tag options of the cocokits theme. */
export const testThemeConfig: ThemeConfig = defineThemeConfig({
  name: 'test',
  components: {
    tag: {
      variant: { attrName: 'variant', values: ['soft', 'solid', 'outline'], default: 'soft' },
      color: { attrName: 'cck-color', values: ['neutral', 'brand'], default: 'neutral' },
      size: { attrName: 'size', values: ['md', 'sm', 'lg'], default: 'md' },
      dot: { attrName: 'dot', values: [true, false], default: false },
    },
  },
});

export function strict(ui: ReactElement): ReactElement {
  return <StrictMode>{ui}</StrictMode>;
}
