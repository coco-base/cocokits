import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import type { Configuration } from 'webpack';

export function registerTsPaths(options: { configFile: string; config: Configuration }) {
  const { config, configFile } = options;
  const tsPaths = new TsconfigPathsPlugin({
    configFile,
  });

  config.resolve = config.resolve ?? {};
  config.resolve.plugins = config.resolve.plugins ?? [];

  // remove existing to prevent multiple ts-paths plugin
  config.resolve.plugins = config.resolve.plugins.filter((plugin) => !(plugin instanceof TsconfigPathsPlugin));

  config.resolve.plugins.push(tsPaths);

  return config;
}
