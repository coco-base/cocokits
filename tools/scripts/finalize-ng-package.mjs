// Makes the ng-packagr output of one Angular package publishable as it is (`npm publish dist/packages/<name>`):
//   node <offset>tools/scripts/finalize-ng-package.mjs [--strip-root]      (cwd: the project root)
// ng-packagr copies the source package.json, so the output still has `workspace:` ranges and
// `publishConfig.directory`, and no LICENSE. This script resolves each `workspace:` range to the version of the
// sibling package (what `pnpm pack` does for the other packages), drops `publishConfig.directory`, and copies the
// LICENSE of the repository. With --strip-root it also removes the "." export, `module` and `typings`: a package
// without a root entry still gets one from ng-packagr, which always builds `src/index.ts`.
import { copyFileSync, existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import process from 'node:process';

const root = resolve(import.meta.dirname, '..', '..');
const project = process.cwd();
const stripRoot = process.argv.includes('--strip-root');
const DEPENDENCY_FIELDS = ['dependencies', 'peerDependencies', 'optionalDependencies'];

const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));

/** Name to version of every package below `packages/`. */
function workspaceVersions() {
  const versions = new Map();
  const stack = [join(root, 'packages')];
  while (stack.length > 0) {
    const folder = stack.pop();
    for (const entry of readdirSync(folder, { withFileTypes: true })) {
      if (!entry.isDirectory() || ['node_modules', 'dist'].includes(entry.name)) continue;
      stack.push(join(folder, entry.name));
    }
    if (existsSync(join(folder, 'package.json'))) {
      const { name, version } = readJson(join(folder, 'package.json'));
      if (name !== undefined && version !== undefined) versions.set(name, version);
    }
  }
  return versions;
}

/** `workspace:*` is the exact version, `workspace:^` and `workspace:~` add the prefix, any other range is kept. */
function resolveRange(name, range, versions) {
  const version = versions.get(name);
  if (version === undefined) throw new Error(`${name} (${range}) is not a package of this workspace`);
  const spec = range.slice('workspace:'.length);
  return spec === '*' ? version : spec === '^' || spec === '~' ? `${spec}${version}` : spec;
}

const source = readJson(join(project, 'package.json'));
const directory = source.publishConfig?.directory;
if (directory === undefined) throw new Error(`${project}/package.json has no publishConfig.directory`);
const dist = resolve(project, directory);
const file = join(dist, 'package.json');
const pkg = readJson(file);

const versions = workspaceVersions();
for (const field of DEPENDENCY_FIELDS) {
  for (const [name, range] of Object.entries(pkg[field] ?? {})) {
    if (range.startsWith('workspace:')) pkg[field][name] = resolveRange(name, range, versions);
  }
}
delete pkg.publishConfig?.directory;
if (stripRoot) {
  delete pkg.exports?.['.'];
  delete pkg.module;
  delete pkg.typings;
}

writeFileSync(file, `${JSON.stringify(pkg, null, 2)}\n`);
copyFileSync(join(root, 'LICENSE'), join(dist, 'LICENSE'));
