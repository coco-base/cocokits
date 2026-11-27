import angular from '@analogjs/vite-plugin-angular';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // The Analog plugin compiles Angular decorators; tests run on the source of internal
  // packages (tsconfig paths), not on their build output.
  plugins: [angular({ tsconfig: 'tsconfig.spec.json' })],
  resolve: { tsconfigPaths: true },
  test: {
    // Tests run in parallel with other projects; the default 5 s is too tight under that load.
    testTimeout: 15_000,
    name: 'theme-cocokits-angular',
    environment: 'jsdom',
    setupFiles: ['tests/setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    passWithNoTests: false,
  },
});
