import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Tests run on the source of internal packages (tsconfig paths), not on their build output.
  resolve: { tsconfigPaths: true },
  test: {
    // Tests run in parallel with other projects; the default 5 s is too tight under that load.
    testTimeout: 15_000,
    name: 'theme-cocokits-react',
    environment: 'node',
    include: ['**/*.test.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    passWithNoTests: false,
  },
});
