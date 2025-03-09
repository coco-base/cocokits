import { getTypedocBaseConfig } from '../../../typedoc.config.base.mjs';

/** @type {Partial<import('typedoc').TypeDocOptions>} */
const config = {
  ...getTypedocBaseConfig('packages/internal/common-kits-doc'),
  entryPoints: [
    "../../common/utils/src/lib",
  ],
  tsconfig: './tsconfig.json',
  out: "./stories/utils",
  exclude: [
    "../../../**/*.spec.ts",
    "../../../**/node_modules/**",
    "../../common/utils/src/lib/rxjs/**/*.ts"
  ]
};

export default config;