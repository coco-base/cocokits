import type { StorybookConfig } from '@storybook/angular';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-essentials',
    '../../../packages/internal/storybook-theme-switcher',
    // {
    //   name: '@storybook/addon-styling-webpack',
    //
    //   options: {
    //     rules: [
    //       {
    //         test: /\.css$/,
    //         sideEffects: true,
    //         use: [
    //           'style-loader',
    //           {
    //             loader: 'css-loader',
    //             options: {},
    //           },
    //         ],
    //       },
    //       {
    //         test: /\.s[ac]ss$/,
    //         sideEffects: true,
    //         use: [
    //           'style-loader',
    //           {
    //             loader: 'css-loader',
    //             options: {
    //               importLoaders: 2,
    //             },
    //           },
    //           'resolve-url-loader',
    //           {
    //             loader: 'sass-loader',
    //             options: {
    //               // Want to add more Sass options? Read more here: https://webpack.js.org/loaders/sass-loader/#options
    //               implementation: 'sass',
    //               sourceMap: true,
    //               sassOptions: {},
    //             },
    //           },
    //         ],
    //       },
    //     ],
    //   },
    // },
  ],
  framework: {
    name: '@storybook/angular',
    options: {},
  },
};

export default config;

// To customize your webpack configuration you can use the webpackFinal field.
// Check https://storybook.js.org/docs/react/builders/webpack#extending-storybooks-webpack-config
// and https://nx.dev/recipes/storybook/custom-builder-configs
