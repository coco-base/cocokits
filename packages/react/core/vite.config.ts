/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import dts from 'vite-plugin-dts';
import * as path from 'path';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import { getExternalPackages } from '../../../tools/scripts/get-external-packages';
import copy from 'rollup-plugin-copy';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../../node_modules/.vite/packages/react/core',

  plugins: [
    react(),
    nxViteTsPaths(),
    peerDepsExternal(),
    dts({
      entryRoot: 'src',
      tsconfigPath: path.join(__dirname, 'tsconfig.lib.json'),
      aliasesExclude: [/^@cocokits\//],
    }),
    copy({
      targets: [{ src: 'README.md', dest: '../../../dist/packages/react/core' }],
      hook: 'writeBundle',
    }),
  ],

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },

  // Configuration for building your library.
  // See: https://vitejs.dev/guide/build.html#library-mode
  build: {
    outDir: '../../../dist/packages/react/core',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    lib: {
      // Could also be a dictionary or array of multiple entry points.
      entry: 'src/index.ts',
      name: 'core',
      fileName: 'index',
      // Change this to the formats you want to support.
      // Don't forget to update your package.json as well.
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      // External packages that should not be bundled into your library.
      external: getExternalPackages(__dirname),
    },
  },
});
