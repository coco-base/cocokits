import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  root: 'src',
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
  // The logos ship as they are.
  copy: ['src/logo/*.svg'],
});
