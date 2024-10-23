/**
 * `main.ts` will be executed in node environment with storybook ts configuration.
 * As a result, the alias `@cocokits/...` is unrecognized in these configurations
 */
import { generateAngularStorybookConfig } from '../../../tools/scripts/storybook/generate-angular-storybook-config';
import { getPackageStories } from '../../../tools/scripts/storybook/get-package-stories';

const config = generateAngularStorybookConfig(
  {
    addons: ['@storybook/addon-google-analytics'],
    stories: [
      '../stories/**/*.mdx',
      '../stories/**/*.stories.@(ts|tsx)',
      ...getPackageStories({
        packageName: '@cocokits/angular-components',
        callerPath: __dirname,
      }),
      ...getPackageStories({
        packageName: '@cocokits/angular-cdk',
        callerPath: __dirname,
      }),
      ...getPackageStories({
        packageName: '@cocokits/core',
        callerPath: __dirname,
      }),
      ...getPackageStories({
        packageName: '@cocokits/common-utils',
        callerPath: __dirname,
      }),
      ...getPackageStories({
        packageName: '@cocokits/angular-utils',
        callerPath: __dirname,
      }),
    ],
    docs: {
      docsMode: true,
    },
  },
  {
    callerPath: __dirname,
  }
);

export default config;
