import type { StorybookConfig } from '@storybook/angular';
import * as path from 'path';

/**
 * `main.ts` will be executed in node environment with storybook ts configuration.
 * As a result, the alias `@cocokits/...` is unrecognized in these configurations
 */
import { deepMerge } from '../../../packages/common/utils/src';

interface AngularStorybookConfigOptions {
  callerPath: string;
}
export function generateAngularStorybookConfig(
  libConfig: Partial<StorybookConfig>,
  options: AngularStorybookConfigOptions
): StorybookConfig {
  return deepMerge<StorybookConfig, Partial<StorybookConfig>>(
    {
      stories: [],
      addons: ['@storybook/addon-essentials', '@cocokits/storybook-addon-theme'],
      framework: {
        name: '@storybook/angular',
        options: {},
      },
      docs: {
        defaultName: 'Docs',
        autodocs: true,
        docsMode: true,
      },
      staticDirs: [
        path.relative(options.callerPath, 'packages/internal/storybook-addon-theme/src/assets'),
        path.relative(options.callerPath, 'packages/internal/common-kits-doc/assets'),
      ],
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
