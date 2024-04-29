import * as path from 'path';
import { registerTsPaths } from '../utils/register-ts-paths';
import { Configuration } from 'webpack';
import { configBase } from './storybook-main.base';

export const webpackConfigBase = {
  addons: [
    ...configBase.addons,
    '@storybook/addon-webpack5-compiler-swc',
    '@storybook/addon-styling-webpack',
    {
      name: '@storybook/addon-styling-webpack',

      options: {
        rules: [
          {
            test: /\.css$/,
            sideEffects: true,
            use: [
              require.resolve('style-loader'),
              {
                loader: require.resolve('css-loader'),
                options: {},
              },
            ],
          },
          {
            test: /\.s[ac]ss$/,
            sideEffects: true,
            use: [
              require.resolve('style-loader'),
              {
                loader: require.resolve('css-loader'),
                options: {
                  importLoaders: 2,
                },
              },
              require.resolve('resolve-url-loader'),
              {
                loader: require.resolve('sass-loader'),
                options: {
                  // Want to add more Sass options? Read more here: https://webpack.js.org/loaders/sass-loader/#options
                  implementation: require.resolve('sass'),
                  sourceMap: true,
                  sassOptions: {},
                },
              },
            ],
          },
        ],
      },
    },
  ],

  webpackFinal: (webpackConfig: Configuration) => {
    const tsConfigPath = path.resolve(__dirname, '../../tsconfig.storybook.json');
    registerTsPaths({ config: webpackConfig, configFile: tsConfigPath });

    return webpackConfig;
  },
};
