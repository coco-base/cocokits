/// <reference types='vitest' />
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import react from '@vitejs/plugin-react-swc';
import * as path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/react-kits-doc',

  plugins: [
    react(),
    nxViteTsPaths(),
    // dts({ entryRoot: 'src', tsconfigPath: path.join(__dirname, 'tsconfig.storybook.json') }),
  ],
});
