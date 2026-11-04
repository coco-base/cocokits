// Interim CSS build: compiles every non-partial src/styles/**/*.scss to the same path under dist/.
// src/styles/styles.scss -> dist/styles.css, src/styles/tokens.scss -> dist/tokens.css,
// src/styles/components/<name>.scss -> dist/components/<name>.css.
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import * as sass from 'sass';

const root = join(import.meta.dirname, '..');
const stylesDir = join(root, 'src', 'styles');
const distDir = join(root, 'dist');

/** @param {string} dir @returns {string[]} */
function listEntries(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((dirent) => {
    const path = join(dir, dirent.name);
    if (dirent.isDirectory()) return listEntries(path);
    return dirent.name.endsWith('.scss') && !dirent.name.startsWith('_') ? [path] : [];
  });
}

for (const source of listEntries(stylesDir)) {
  const target = join(distDir, relative(stylesDir, source).replace(/\.scss$/, '.css'));
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, sass.compile(source).css);
}
