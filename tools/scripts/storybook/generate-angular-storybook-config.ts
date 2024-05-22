import type { StorybookConfig } from '@storybook/angular';
import * as path from 'path';

/**
 * Issue: Storybook does not use our project's tsconfig for compiling `main.js`.
 * 'main.ts` will be executed in node environment with storybook ts configuration. As a result,
 * the alias `@coco-kits/...` is unrecognized in these configurations, leading to a module resolution error:
 * Error: No "exports" main defined in /packages/internal/storybook-core/node_modules/@coco-kits/.../package.json.
 * Note: Our tsconfig paths are effective only post-compilation of `main.ts`, thus usable within stories and components but not in initial configuration files.
 * And since the `@coco-kits/...` is a buildable package we can not link 'main' file to `index.ts`
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
        path.relative(options.callerPath, 'packages/internal/storybook-theme-switcher'),
      ],
      framework: {
        name: '@storybook/angular',
        options: {},
      },
      docs: {
        autodocs: true,
        defaultName: 'Docs',
      },
      staticDirs: [path.relative(options.callerPath, 'packages/internal/storybook-core/src/assets')],
    },
    libConfig
  );
}
