import angular from '@analogjs/vite-plugin-angular';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // The Analog plugin compiles Angular decorators; tests run on the source of internal
  // packages (tsconfig paths), not on their build output.
  plugins: [angular({ tsconfig: 'tsconfig.spec.json' })],
  resolve: { tsconfigPaths: true },
  test: {
    name: 'angular',
    environment: 'jsdom',
    setupFiles: ['tests/setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', 'core/**'],
    passWithNoTests: false,
  },
});
