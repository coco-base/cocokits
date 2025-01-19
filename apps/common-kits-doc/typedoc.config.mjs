import { getTypedocBaseConfig } from '../../typedoc.config.base.mjs';

/** @type {Partial<import('typedoc').TypeDocOptions>} */
const config = {
  ...getTypedocBaseConfig('apps/common-kits-doc'),
  entryPoints: [
    "../../packages/common/utils/src/lib",
  ],
  tsconfig: './tsconfig.json',
  out: "./stories/utils",
  exclude: [
    "../../**/*.spec.ts",
    "../../**/node_modules/**",
    "../../packages/common/utils/src/lib/rxjs/**/*.ts"
  ]
};

export default config;