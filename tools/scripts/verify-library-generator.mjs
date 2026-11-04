// Buildability proof for the `library` generator. Not part of any Nx target: it installs the framework
// tooling, so run it by hand when the generator or its templates change:
//   node tools/scripts/verify-library-generator.mjs
// It never touches the real working tree. It copies the workspace root files, tools/ and .changeset/ into a fresh
// temporary directory (no node_modules, dist, .nx, .tmp, .git, packages, docs), generates every package kind
// into an empty packages/ there, runs build, lint, typecheck and test, adds one entry point of every kind, runs the
// targets again, checks that the built @cocokits/angular package.json has no "." export, and deletes the directory.
// The tool kind is generated as `verify-tool`: it has no build, so lint, typecheck and test run on it, and its source
// imports `@cocokits/shared` to prove the `type:tool` boundary. Real tool projects are not copied: they need the real
// packages.
import { execSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve, sep } from 'node:path';
import process from 'node:process';

const source = resolve(import.meta.dirname, '..', '..');
const require = createRequire(import.meta.url);
const SKIPPED = new Set([
  'node_modules',
  'dist',
  '.nx',
  '.tmp',
  '.git',
  '.claude',
  '.husky',
  'packages',
  'docs',
  'size-limit.config.mjs',
]);

/** Folders of `tools/` the copy needs; any other folder is a real tool project, which needs the real packages. */
const KEPT_TOOLS = new Set(['workspace-plugin', 'eslint', 'scripts']);

const PACKAGES = [
  { kind: 'shared-lib', name: 'utils' },
  { kind: 'shared-lib', name: 'shared' },
  { kind: 'cdk' },
  { kind: 'machines' },
  { kind: 'tool', name: 'verify-tool' },
  ...['angular', 'react', 'vue'].flatMap((framework) => [
    { kind: 'fw-core', framework },
    { kind: 'fw', framework },
  ]),
  { kind: 'theme-core', theme: 'verify' },
  ...['angular', 'react', 'vue'].map((framework) => ({ kind: 'theme-fw', theme: 'verify', framework })),
];

const ENTRIES = [
  { kind: 'cdk-module', name: 'reactive' },
  { kind: 'machine', name: 'switch' },
  { kind: 'fw-entry', name: 'tabs', framework: 'angular' },
  { kind: 'angular-testing', name: 'tabs' },
  { kind: 'fw-entry', name: 'switch', framework: 'react' },
  { kind: 'fw-entry', name: 'switch', framework: 'vue' },
];

/** Copies only what the generator needs: root files, tools/ and .changeset/; never build output or modules. */
function copyWorkspace(target) {
  cpSync(source, target, {
    recursive: true,
    filter: (path) => {
      const parts = relative(source, path).split(sep);
      const projectTool = parts[0] === 'tools' && parts.length > 1 && !KEPT_TOOLS.has(parts[1] ?? '');
      return !(SKIPPED.has(parts[0]) || projectTool || parts.includes('node_modules'));
    },
  });
}

/**
 * The copy starts without packages: reset the path aliases the real repo may have by now, and drop the root
 * dependencies on workspace projects that are not copied (every `@cocokits/*` but the plugin).
 */
function prepareWorkspace(target) {
  const base = join(target, 'tsconfig.base.json');
  const tsconfig = JSON.parse(readFileSync(base, 'utf8'));
  tsconfig.compilerOptions.paths = {};
  writeFileSync(base, `${JSON.stringify(tsconfig, null, 2)}\n`);
  const rootPackage = join(target, 'package.json');
  const manifest = JSON.parse(readFileSync(rootPackage, 'utf8'));
  manifest.devDependencies = Object.fromEntries(
    Object.entries(manifest.devDependencies ?? {}).filter(
      ([name]) => !name.startsWith('@cocokits/') || name === '@cocokits/workspace',
    ),
  );
  writeFileSync(rootPackage, `${JSON.stringify(manifest, null, 2)}\n`);
}

function run(command, cwd) {
  execSync(command, { cwd, stdio: 'inherit', env: { ...process.env, NX_DAEMON: 'false', CI: '1' } });
}

function generator(target) {
  require(join(target, 'node_modules', '@swc-node', 'register'));
  const { FsTree, flushChanges } = require(join(target, 'node_modules', 'nx', 'dist', 'src', 'generators', 'tree'));
  const library = require(
    join(target, 'tools', 'workspace-plugin', 'src', 'generators', 'library', 'generator.ts'),
  ).default;
  return async (options) => {
    const tree = new FsTree(target, false);
    await library(tree, options);
    flushChanges(target, tree.listChanges());
  };
}

function verifyTargets(target) {
  run('pnpm install --no-frozen-lockfile --ignore-scripts', target);
  run(
    'pnpm exec nx run-many -t build lint typecheck test --exclude=workspace --skip-nx-cache --output-style=stream',
    target,
  );
}

function verifyAngularDist(target) {
  const file = join(target, 'dist', 'packages', 'angular', 'package.json');
  const pkg = JSON.parse(readFileSync(file, 'utf8'));
  const keys = Object.keys(pkg.exports);
  if (keys.includes('.') || 'module' in pkg || 'typings' in pkg)
    throw new Error(`${file} still has a root entry: ${keys}`);
  process.stdout.write(`@cocokits/angular dist exports: ${keys.join(', ')}\n`);
}

/**
 * One real cross-package import per allowed edge of nx-tags-and-boundaries.md. Every module exports a marker string
 * (explicit type for isolatedDeclarations) and re-exports the markers of the packages it imports. `dist` is the
 * build output folder (relative to the workspace); `imports` must stay bare specifiers in it, and no marker of an
 * imported package may be inlined.
 */
const marker = (name) => `cck-marker-${name}`;
const moduleSource = (name, imports) =>
  `${imports.map((specifier, index) => `import { marker as m${index} } from '${specifier}';`).join('\n')}\n` +
  `export const marker${imports.length > 0 ? ': string' : ''} = '${marker(name)}'${imports.map((_, index) => ` + m${index}`).join('')};\n`;

const WIRED = [
  { name: 'utils', file: 'packages/utils/src/index.ts', imports: [], dist: 'packages/utils/dist' },
  { name: 'shared', file: 'packages/shared/src/index.ts', imports: [], dist: 'packages/shared/dist' },
  {
    name: 'cdk-reactive',
    file: 'packages/cdk/src/reactive/index.ts',
    imports: ['@cocokits/utils', '@cocokits/shared'],
    dist: 'packages/cdk/dist/reactive',
  },
  {
    name: 'machines-switch',
    file: 'packages/machines/switch/index.ts',
    imports: ['@cocokits/cdk/reactive'],
    dist: 'packages/machines/dist/switch',
  },
  ...['angular', 'react', 'vue'].flatMap((fw) => [
    {
      name: `${fw}-core`,
      file: `packages/${fw}/core/src/index.ts`,
      imports: ['@cocokits/shared'],
      dist: fw === 'angular' ? 'dist/packages/angular-core' : `packages/${fw}/core/dist`,
    },
  ]),
  {
    name: 'angular-tabs',
    file: 'packages/angular/tabs/index.ts',
    imports: ['@cocokits/angular-core', '@cocokits/machines/switch'],
    dist: 'dist/packages/angular',
  },
  {
    name: 'react-switch',
    file: 'packages/react/src/switch/index.ts',
    imports: ['@cocokits/react-core', '@cocokits/machines/switch'],
    dist: 'packages/react/dist/switch',
  },
  {
    name: 'vue-switch',
    file: 'packages/vue/src/switch/index.ts',
    imports: ['@cocokits/vue-core', '@cocokits/machines/switch'],
    dist: 'packages/vue/dist/switch',
  },
  {
    name: 'theme-core',
    file: 'packages/themes/verify/core/src/index.ts',
    imports: ['@cocokits/shared'],
    dist: 'packages/themes/verify/core/dist',
  },
  // A tool has no build output, so only its source is wired: lint proves `type:tool` may import `shared`.
  { name: 'tool', file: 'tools/verify-tool/src/placeholder.ts', imports: ['@cocokits/shared'], dist: undefined },
  ...['angular', 'react', 'vue'].map((fw) => ({
    name: `theme-${fw}`,
    file: `packages/themes/verify/${fw}/src/index.ts`,
    imports: ['@cocokits/theme-verify', `@cocokits/${fw}-core`],
    dist: fw === 'angular' ? 'dist/packages/theme-verify-angular' : `packages/themes/verify/${fw}/dist`,
  })),
];

function writeWiring(target) {
  for (const { name, file, imports } of WIRED) {
    const path = join(target, file);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, moduleSource(name, imports));
  }
}

function builtFiles(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((dirent) => {
    const path = join(directory, dirent.name);
    if (dirent.isDirectory()) return dirent.name === 'node_modules' ? [] : builtFiles(path);
    return /\.(m?js)$/.test(dirent.name) ? [path] : [];
  });
}

/** Internal imports must survive the build as bare specifiers; the imported code must not be inlined. */
function verifyExternalImports(target) {
  const byFile = new Map(WIRED.map((wired) => [wired.name, wired]));
  for (const { name, imports, dist } of WIRED) {
    if (imports.length === 0 || dist === undefined) continue;
    const files = builtFiles(join(target, dist));
    const code = files.map((file) => readFileSync(file, 'utf8')).join('\n');
    if (!code.includes(marker(name))) throw new Error(`${dist}: built output of ${name} not found`);
    for (const specifier of imports) {
      if (!new RegExp(`from\\s*['"]${specifier}['"]`).test(code)) {
        throw new Error(`${dist}: the import of ${specifier} is not a bare specifier in the built output (${files.length} files)
${code}`);
      }
    }
    for (const other of byFile.values()) {
      if (other.name !== name && code.includes(marker(other.name))) {
        throw new Error(`${dist}: the code of ${other.name} was inlined into ${name}`);
      }
    }
    process.stdout.write(`external imports ok: ${name} -> ${imports.join(', ')}\n`);
  }
}

const work = mkdtempSync(join(tmpdir(), 'cocokits-verify-'));
try {
  copyWorkspace(work);
  prepareWorkspace(work);
  run('pnpm install --no-frozen-lockfile --ignore-scripts', work);
  const generate = generator(work);
  for (const options of PACKAGES) await generate(options);
  process.stdout.write('--- packages without entry points ---\n');
  verifyTargets(work);
  for (const options of ENTRIES) await generate(options);
  process.stdout.write('--- packages with one entry point of every kind ---\n');
  verifyTargets(work);
  verifyAngularDist(work);
  writeWiring(work);
  process.stdout.write('--- packages importing their allowed lower layers ---\n');
  verifyTargets(work);
  verifyExternalImports(work);
  process.stdout.write(
    `verify-library-generator: OK (${PACKAGES.length} packages, then ${ENTRIES.length} entry points: build, lint, typecheck, test)\n`,
  );
} finally {
  rmSync(work, { recursive: true, force: true });
}
