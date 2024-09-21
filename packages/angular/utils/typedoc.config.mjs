import { getTypedocBaseConfig } from '../../../typedoc.config.base.mjs';

/** @type {Partial<import('typedoc').TypeDocOptions>} */
const config = {
  ...getTypedocBaseConfig('packages/angular/utils'),
  entryPoints: ["./src/lib"],
  tsconfig: './tsconfig.lib.json',
  out: "./stories/utils",
  exclude: [
    "**/*.spec.ts",
    "**/node_modules/**",
    "./src/lib/rxjs/**/*.ts"
  ]
};

export default config;