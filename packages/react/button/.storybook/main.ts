import { generateReactStorybookConfig } from '../../../../tools/scripts/storybook/generate-react-storybook-config';

const config = generateReactStorybookConfig({
  stories: ['../stories/**/*.mdx', '../stories/**/index.stories.@(ts|tsx)', '../stories/**/dev.stories.@(ts|tsx)'],
});

export default config;

// To customize your Vite configuration you can use the viteFinal field.
// Check https://storybook.js.org/docs/react/builders/vite#configuration
// and https://nx.dev/recipes/storybook/custom-builder-configs
