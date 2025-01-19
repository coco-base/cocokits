import { getTypedocBaseConfig } from '../../typedoc.config.base.mjs';

/** @type {Partial<import('typedoc').TypeDocOptions>} */
const config = {
  ...getTypedocBaseConfig('apps/react-kits-doc'),
  entryPoints: [
    "../../packages/react/utils/src/lib",
  ],
  tsconfig: './tsconfig.typedoc.json',
  out: "./stories/utils",
  exclude: [
    "../../**/*.spec.ts",
    "../../**/node_modules/**",
    "../../packages/react/utils/src/lib/rxjs/**/*.ts",
  ]
};

export default config;