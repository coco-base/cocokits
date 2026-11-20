import { existsSync, readdirSync } from 'node:fs';
import { isAbsolute, join } from 'node:path';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

const root = import.meta.dirname;

/** One entry per `src/index.ts` and per `src/<name>/index.ts`; the keys keep the folder structure in `dist`. */
function collectEntries() {
  const entries = {};
  if (existsSync(join(root, 'src', 'index.ts'))) entries['index'] = join(root, 'src', 'index.ts');
  for (const dirent of readdirSync(join(root, 'src'), { withFileTypes: true })) {
    const file = join(root, 'src', dirent.name, 'index.ts');
    if (dirent.isDirectory() && existsSync(file)) entries[`${dirent.name}/index`] = file;
  }
  // A package without entry points yet still builds: the placeholder keeps the build non-empty.
  const placeholder = join(root, 'src', 'placeholder.ts');
  if (Object.keys(entries).length === 0 && existsSync(placeholder)) entries['placeholder'] = placeholder;
  return entries;
}

export default defineConfig({
  root,
  plugins: [vue()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2022',
    lib: { entry: collectEntries(), formats: ['es'] },
    rollupOptions: {
      // Imports stay external: no workspace package and no peer is bundled.
      external: (id) => !id.startsWith('.') && !isAbsolute(id),
      output: { preserveModules: true, preserveModulesRoot: 'src', entryFileNames: '[name].js' },
    },
  },
});
