import * as path from 'path';
import { Configuration } from 'webpack';

import { configBase } from './storybook-main.base';
import { registerTsPaths } from '../utils/register-ts-paths';

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
              'style-loader',
              {
                loader: 'css-loader',
                options: {},
              },
            ],
          },
          {
            test: /\.s[ac]ss$/,
            sideEffects: true,
            use: [
              'style-loader',
              {
                loader: 'css-loader',
                options: {
                  importLoaders: 2,
                },
              },
              'resolve-url-loader',
              {
                loader: 'sass-loader',
                options: {
                  // Want to add more Sass options? Read more here: https://webpack.js.org/loaders/sass-loader/#options
                  implementation: 'sass',
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
