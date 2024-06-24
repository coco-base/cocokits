/**
 * `main.ts` will be executed in node environment with storybook ts configuration.
 * As a result, the alias `@cocokits/...` is unrecognized in these configurations
 */
import { generateAngularStorybookConfig } from '../../../../tools/scripts/storybook/generate-angular-storybook-config';

const config = generateAngularStorybookConfig(
  {
    stories: ['../stories/**/*.mdx', '../stories/**/index.stories.@(ts|tsx)', '../stories/**/dev.stories.@(ts|tsx)'],
  },
  {
    callerPath: __dirname,
  }
);

export default config;
