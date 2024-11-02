/**
 * `main.ts` will be executed in node environment with storybook ts configuration.
 * As a result, the alias `@cocokits/...` is unrecognized in these configurations
 */
import { generateReactStorybookConfig } from '../../../tools/scripts/storybook/generate-react-storybook-config';
import { getPackageStories } from '../../../tools/scripts/storybook/get-package-stories';

const config = generateReactStorybookConfig({
  addons: ['@storybook/addon-google-analytics'],
  stories: [
    '../stories/**/*.mdx',
    '../stories/**/*.stories.@(ts|tsx)',
    ...getPackageStories({
      packageName: '@cocokits/react-components',
      callerPath: __dirname,
    }),
    ...getPackageStories({
      packageName: '@cocokits/react-cdk',
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
      packageName: '@cocokits/react-utils',
      callerPath: __dirname,
    }),
  ],
  docs: {
    docsMode: true,
  },
});

export default config;
