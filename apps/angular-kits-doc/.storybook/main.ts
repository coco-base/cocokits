/**
 * `main.ts` will be executed in node environment with storybook ts configuration.
 * As a result, the alias `@coco-kits/...` is unrecognized in these configurations
 */
import { generateAngularStorybookConfig } from '../../../tools/scripts/storybook/generate-angular-storybook-config';
import { getPackageStories } from '../../../tools/scripts/storybook/get-package-stories';

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
    docs: {
      docsMode: true,
    },
  },
  {
    callerPath: __dirname,
  }
);

export default config;
