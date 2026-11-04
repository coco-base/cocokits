// The publish checks of one package, run by the `pack`, `publint` and `attw` targets of nx.json:
//   node tools/scripts/package-checks.mjs pack|publint|attw <projectName>
// `pack` writes the tarball `pnpm pack` makes (what npm would receive: `workspace:*` resolved, `publishConfig.directory`
// followed for the ng-packagr packages) to dist/tarballs/<projectName>. The other two check that tarball.
import { spawnSync } from 'node:child_process';
import { mkdirSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import process from 'node:process';

const [action, projectName] = process.argv.slice(2);
const root = resolve(import.meta.dirname, '..', '..');
const tarballs = join(root, 'dist', 'tarballs', projectName ?? '');

/** The folder of the project, from the `project.json` files below `packages/`. */
function projectRootOf(name) {
  const stack = [join(root, 'packages')];
  while (stack.length > 0) {
    const folder = stack.pop();
    for (const entry of readdirSync(folder, { withFileTypes: true })) {
      if (!entry.isDirectory() || ['node_modules', 'dist'].includes(entry.name)) continue;
      const path = join(folder, entry.name);
      stack.push(path);
      try {
        if (JSON.parse(readFileSync(join(path, 'project.json'), 'utf8')).name === name) return path;
      } catch {
        // no project.json in this folder
      }
    }
  }
  throw new Error(`no project named "${name}" below packages/`);
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function tarball() {
  const files = readdirSync(tarballs).filter((name) => name.endsWith('.tgz'));
  if (files.length !== 1) throw new Error(`expected one tarball in ${tarballs}, found ${String(files.length)}`);
  return join(tarballs, files[0] ?? '');
}

/** The `exports` keys of the packed package.json that name a stylesheet or an image. */
function assetExports(file) {
  // Relative to its folder: GNU tar reads `C:` of an absolute Windows path as a host name.
  const result = spawnSync('tar', ['-xOzf', basename(file), 'package/package.json'], {
    cwd: dirname(file),
    encoding: 'utf8',
  });
  if (result.status !== 0) throw new Error(`cannot read package.json from ${file}: ${result.stderr}`);
  const exports = JSON.parse(result.stdout).exports ?? {};
  return Object.keys(exports).filter((key) => /\.(css|svg)$/.test(key));
}

if (projectName === undefined) throw new Error('usage: package-checks.mjs pack|publint|attw <projectName>');

switch (action) {
  case 'pack':
    rmSync(tarballs, { recursive: true, force: true });
    mkdirSync(tarballs, { recursive: true });
    run('pnpm', ['pack', '--pack-destination', tarballs], projectRootOf(projectName));
    break;
  case 'publint':
    run('pnpm', ['exec', 'publint', 'run', tarball(), '--level', 'warning', '--strict'], root);
    break;
  case 'attw': {
    // The packages are ESM only: the CommonJS and node10 columns are not part of the contract. Stylesheet and image
    // exports are files, not modules, so they are not entry points to check.
    const assets = assetExports(tarball());
    const exclude = assets.length > 0 ? ['--exclude-entrypoints', ...assets] : [];
    run('pnpm', ['exec', 'attw', tarball(), '--profile', 'esm-only', ...exclude], root);
    break;
  }
  default:
    throw new Error(`unknown action "${String(action)}"; use pack, publint or attw`);
}
