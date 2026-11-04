import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Tests run on the source of internal packages (tsconfig paths), not on their build output.
  resolve: { tsconfigPaths: true },
  test: {
    name: 'react',
    environment: 'node',
    include: ['**/*.test.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', 'core/**'],
    passWithNoTests: false,
  },
});
