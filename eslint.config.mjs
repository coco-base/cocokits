import { createBaseConfig } from './tools/eslint/base.mjs';
import { createBoundariesConfig } from './tools/eslint/boundaries.mjs';
import { createContractConfig } from './tools/eslint/contract-rules.mjs';
import { createEntryPointConfig } from './tools/eslint/entry-points.mjs';
import { createExceptionsConfig } from './tools/eslint/exceptions.mjs';
import { createIsolationConfig } from './tools/eslint/isolation-rules.mjs';

export default [
  ...createBaseConfig({ tsconfigRootDir: import.meta.dirname }),
  ...createBoundariesConfig(),
  ...createEntryPointConfig(),
  ...createContractConfig({ rootDir: import.meta.dirname }),
  ...createIsolationConfig({ rootDir: import.meta.dirname }),
  ...createExceptionsConfig({ rootDir: import.meta.dirname }),
];
