import { getTypedocBaseConfig } from '../../typedoc.config.base.mjs';

/** @type {Partial<import('typedoc').TypeDocOptions>} */
const config = {
  ...getTypedocBaseConfig('apps/angular-kits-doc'),
  entryPoints: [
    "../../packages/angular/utils/src/lib",
  ],
  tsconfig: './tsconfig.typedoc.json',
  out: "./stories/utils",
  exclude: [
    "../../**/*.spec.ts",
    "../../**/node_modules/**",
    "../../packages/angular/utils/src/lib/rxjs/**/*.ts",
  ]
};

export default config;