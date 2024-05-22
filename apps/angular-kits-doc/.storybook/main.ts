/**
 * Issue: Storybook does not use our project's tsconfig for compiling `main.js`.
 * 'main.ts` will be executed in node environment with storybook ts configuration. As a result,
 * the alias `@coco-kits/...` is unrecognized in these configurations, leading to a module resolution error:
 * Error: Cannot find module '@coco-kits/...'.
 * Note: Our tsconfig paths are effective only post-compilation of `main.ts`, thus usable within stories and components but not in initial configuration files.
 */
// eslint-disable-next-line @nx/enforce-module-boundaries
import { getPackageStories } from '../../../tools/scripts/storybook/get-package-stories';
import { generateAngularStorybookConfig } from '../../../tools/scripts/storybook/generate-angular-storybook-config';

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
