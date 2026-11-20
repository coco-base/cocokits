import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['*/index.ts', 'placeholder.ts'],
  root: '.',
  format: 'esm',
  platform: 'neutral',
  target: 'es2022',
  unbundle: true,
  dts: true,
  hash: false,
  fixedExtension: false,
  clean: true,
  outDir: 'dist',
  tsconfig: 'tsconfig.lib.json',
});
