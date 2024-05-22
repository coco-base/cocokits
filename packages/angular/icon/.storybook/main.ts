import path from 'path';

/**
 * Issue: Storybook does not use our project's tsconfig for compiling `main.js`.
 * 'main.ts` will be executed in node environment with storybook ts configuration. As a result,
 * the alias `@coco-kits/...` is unrecognized in these configurations, leading to a module resolution error:
 * Error: Cannot find module '@coco-kits/...'.
 * Note: Our tsconfig paths are effective only post-compilation of `main.ts`, thus usable within stories and components but not in initial configuration files.
 */
// eslint-disable-next-line @nx/enforce-module-boundaries
// import { generateAngularStorybookConfig } from '../../../internal/storybook-core';

// const config = generateAngularStorybookConfig(
//   {
//     stories: ['../stories/**/*.stories.mdx', '../stories/**/index.stories.@(ts|tsx)'],
//   },
//   {
//     callerPath: __dirname,
//   }
// );

const config = {
  stories: ['../stories/**/*.stories.mdx', '../stories/**/index.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials', path.relative(__dirname, 'packages/internal/storybook-theme-switcher')],
  framework: {
    name: '@storybook/angular',
    options: {},
  },
  docs: {
    autodocs: true,
    defaultName: 'Docs',
  },
  staticDirs: [path.relative(__dirname, 'packages/internal/storybook-core/src/assets')],
};
export default config;
