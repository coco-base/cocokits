/**
 * TODO: Implement a workaround to utilize the `@coco-kits/storybook-core` alias instead of a relative path.
 * Issue: Storybook does not use our project's tsconfig for compiling `main.js`.
 * 'main.ts` will be executed in node environment with storybook ts configuration. As a result,
 * the alias `@coco-kits/storybook-core` is unrecognized in these configurations, leading to a module resolution error:
 * Error: Cannot find module '@coco-kits/storybook-core'.
 * Note: Our tsconfig paths are effective only post-compilation of `main.ts`, thus usable within stories and components but not in initial configuration files.
 */
// eslint-disable-next-line @nx/enforce-module-boundaries
import { generateAngularStorybookConfig, getPackageStories } from '../../../packages/internal/storybook-core';

const config = generateAngularStorybookConfig(
  {
    stories: [
      '../stories/**/*.stories.mdx',
      '../stories/**/*.stories.@(ts|tsx)',
      ...getPackageStories({
        packageName: '@coco-kits/angular-components',
        callerPath: __dirname,
      }),
    ],
  },
  {
    callerPath: __dirname,
  }
);

export default config;
