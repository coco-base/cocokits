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
      '../stories/**/index.stories.@(ts|tsx)',
      ...getPackageStories({
        packageName: '@cocokits/common-kits-doc',
        callerPath: __dirname,
      }),
    ],
  },
  {
    callerPath: __dirname,
  }
);

export default config;
