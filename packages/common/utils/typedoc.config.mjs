import { getTypedocBaseConfig } from '../../../typedoc.config.base.mjs';

/** @type {Partial<import('typedoc').TypeDocOptions>} */
const config = {
  ...getTypedocBaseConfig('packages/common/utils'),
  entryPoints: ["./src/lib"],
  tsconfig: './tsconfig.lib.json',
  out: "./stories/utils",
};

export default config;