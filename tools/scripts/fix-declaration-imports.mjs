// Makes the relative imports of the emitted declarations explicit, for the Vue packages:
//   node tools/scripts/fix-declaration-imports.mjs <dist folder>
// vue-tsc writes `./accordion.types` and `./AccordionRoot.vue` where Node's ESM resolution (module Node16 and
// NodeNext) needs a file extension, so a consumer on that resolution loses the types behind the import. The script
// appends `.js` (a folder gets `/index.js`); TypeScript maps `./X.types.js` to `X.types.d.ts` and `./X.vue.js` to
// `X.vue.d.ts`. It changes declaration files only.
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import process from 'node:process';

const SPECIFIER = /(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(['"])(\.{1,2}\/[^'"]*)\2/g;

function declarationFiles(folder) {
  return readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    const path = join(folder, entry.name);
    if (entry.isDirectory()) return declarationFiles(path);
    return entry.name.endsWith('.d.ts') ? [path] : [];
  });
}

/** The specifier with its extension, or undefined when it already has one or points at nothing declared. */
function explicit(file, specifier) {
  if (specifier.endsWith('.js')) return undefined;
  const target = resolve(dirname(file), specifier);
  if (existsSync(`${target}.d.ts`)) return `${specifier}.js`;
  if (existsSync(target) && statSync(target).isDirectory() && existsSync(join(target, 'index.d.ts'))) {
    return `${specifier.replace(/\/$/, '')}/index.js`;
  }
  return undefined;
}

const folder = resolve(process.argv[2] ?? '');
let changed = 0;
for (const file of declarationFiles(folder)) {
  const before = readFileSync(file, 'utf8');
  const after = before.replace(SPECIFIER, (match, lead, quote, specifier) => {
    const fixed = explicit(file, specifier);
    return fixed === undefined ? match : `${lead}${quote}${fixed}${quote}`;
  });
  if (after !== before) {
    writeFileSync(file, after);
    changed += 1;
  }
}
console.log(`fix-declaration-imports: ${String(changed)} declaration file(s) changed in ${folder}`);
