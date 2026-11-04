import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Tests run on the source of internal packages (tsconfig paths), not on their build output.
  resolve: { tsconfigPaths: true },
  test: {
    name: 'theme-cocokits',
    environment: 'node',
    include: ['**/*.test.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    passWithNoTests: false,
  },
});
