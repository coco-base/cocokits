// The publish checks of one package, run by the `pack`, `publint` and `attw` targets of nx.json:
//   node tools/scripts/package-checks.mjs pack|publint|attw <projectName>
// `pack` writes the tarball `pnpm pack` makes (what npm would receive: `workspace:*` resolved, `publishConfig.directory`
// followed for the ng-packagr packages) to dist/tarballs/<projectName>. The other two check that tarball. `publint` also
// checks that the tarball is publishable as it is (`checkPublishable`).
import { spawnSync } from 'node:child_process';
import { mkdirSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import process from 'node:process';
import { problemsOf } from './package-manifest.mjs';

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

/** Runs tar on a tarball. Relative to its folder: GNU tar reads `C:` of an absolute Windows path as a host name. */
function tar(file, flags, ...paths) {
  const result = spawnSync('tar', [flags, basename(file), ...paths], { cwd: dirname(file), encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`cannot read ${file}: ${result.stderr}`);
  return result.stdout;
}

function packedManifest(file) {
  return JSON.parse(tar(file, '-xOzf', 'package/package.json'));
}

/** The `exports` keys of the packed package.json that name a stylesheet or an image. */
function assetExports(file) {
  return Object.keys(packedManifest(file).exports ?? {}).filter((key) => /\.(css|svg)$/.test(key));
}

/** Every file below `folder`, relative to it. */
function filesBelow(folder, prefix = '') {
  return readdirSync(join(folder, prefix), { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? filesBelow(folder, `${prefix}${entry.name}/`) : [`${prefix}${entry.name}`],
  );
}

/**
 * Fails when a package is not publishable as it is: a `workspace:`, `link:` or `file:` range, a
 * `publishConfig.directory` left over, no `name`, `version` or `license` field, no LICENSE or README.md, or a file
 * named by `exports`, `main`, `module`, `types` or `bin` that is missing. It checks the tarball and, for a package
 * that publishes from its build output (`publishConfig.directory`), that folder too: it is what `npm publish` gets.
 */
function checkPublishable(file) {
  const listing = tar(file, '-tzf')
    .split('\n')
    .map((item) => item.trim());
  const checks = [
    {
      where: 'tarball',
      manifest: packedManifest(file),
      packed: new Set(listing.filter((item) => item.startsWith('package/')).map((item) => item.slice(8))),
    },
  ];
  const source = join(projectRootOf(projectName), 'package.json');
  const directory = JSON.parse(readFileSync(source, 'utf8')).publishConfig?.directory;
  if (directory !== undefined) {
    const dist = resolve(dirname(source), directory);
    checks.push({
      where: `${directory} (build output)`,
      manifest: JSON.parse(readFileSync(join(dist, 'package.json'), 'utf8')),
      packed: new Set(filesBelow(dist)),
    });
  }
  const failed = checks.flatMap(({ where, manifest, packed }) =>
    problemsOf(manifest, packed).map((problem) => `  - ${String(manifest.name)} ${where}: ${problem}`),
  );
  if (failed.length > 0) {
    console.error(`${projectName} is not publishable as it is:`);
    for (const line of failed) console.error(line);
    process.exit(1);
  }
}

if (projectName === undefined) throw new Error('usage: package-checks.mjs pack|publint|attw <projectName>');

switch (action) {
  case 'pack':
    rmSync(tarballs, { recursive: true, force: true });
    mkdirSync(tarballs, { recursive: true });
    run('pnpm', ['pack', '--pack-destination', tarballs], projectRootOf(projectName));
    break;
  case 'publint':
    checkPublishable(tarball());
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
