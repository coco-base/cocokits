import type { StorybookConfig } from '@storybook/angular';
import * as path from 'path';

/**
 * `main.ts` will be executed in node environment with storybook ts configuration.
 * As a result, the alias `@coco-kits/...` is unrecognized in these configurations
 */
// eslint-disable-next-line @nx/enforce-module-boundaries
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
      addons: [
        '@storybook/addon-essentials',
        '@coco-kits/storybook-theme-switcher',
        '@coco-kits/storybook-doc-page',
        // path.relative(options.callerPath, 'packages/internal/storybook-theme-switcher'),
        // path.relative(options.callerPath, 'packages/internal/storybook-doc-page'),
      ],
      framework: {
        name: '@storybook/angular',
        options: {},
      },
      docs: {
        defaultName: 'Docs',
      },
      staticDirs: [
        path.relative(options.callerPath, 'packages/internal/storybook-theme-switcher/src/assets'),
        path.relative(options.callerPath, 'packages/internal/storybook-doc-page/src/assets'),
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
