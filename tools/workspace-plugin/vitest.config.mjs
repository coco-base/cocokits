import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Tests run in parallel with other projects; the default 5 s is too tight under that load.
    testTimeout: 15_000,
    name: 'workspace',
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    // Some specs build a TypeScript or Angular program, which takes longer than 5 seconds when the machine is busy.
    testTimeout: 60_000,
    passWithNoTests: false,
  },
});
