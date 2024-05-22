import type { StorybookConfig } from '@storybook/html-webpack5';

const config: StorybookConfig = {
  stories: ['../src/stories/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [],
  framework: {
    name: '@storybook/html-webpack5',
    options: {
      builder: {
        viteConfigPath: 'vite.config.ts',
      },
    },
  },
  staticDirs: ['../../../packages/internal/storybook-core/src/assets'],
};

export default config;

// To customize your Vite configuration you can use the viteFinal field.
// Check https://storybook.js.org/docs/react/builders/vite#configuration
// and https://nx.dev/recipes/storybook/custom-builder-configs
