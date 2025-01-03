import type { StorybookConfig } from '@storybook/react-vite';
import * as path from 'path';

/**
 * `main.ts` will be executed in node environment with storybook ts configuration.
 * As a result, the alias `@cocokits/...` is unrecognized in these configurations
 */
import { deepMerge } from '../../../packages/common/utils/src';

export function generateReactStorybookConfig(libConfig: Partial<StorybookConfig>): StorybookConfig {
  return deepMerge<StorybookConfig, Partial<StorybookConfig>>(
    {
      stories: [],
      addons: ['@storybook/addon-essentials', '@cocokits/storybook-addon-theme'],
      framework: {
        name: '@storybook/react-vite',
        options: {
          builder: {
            viteConfigPath: 'vite.config.ts',
          },
        },
      },
      docs: {
        defaultName: 'Docs',
      },
      staticDirs: [path.join(__dirname, '../../../packages/internal/storybook-addon-theme/src/assets')],
      env: (env) => {
        return {
          NODE_ENV: env?.['NODE_ENV'] ?? '',
          NODE_PATH: env?.['NODE_PATH'] ?? '',
          STORYBOOK: env?.['STORYBOOK'] ?? '',
          PUBLIC_URL: env?.['PUBLIC_URL'] ?? '',
        };
      },
    },
    libConfig
  );
}
