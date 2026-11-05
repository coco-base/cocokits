import { generateFiles, joinPathFragments, offsetFromRoot, writeJson, type Tree } from '@nx/devkit';
import { join } from 'node:path';
import type { Compatibility } from './compat';
import { WORKSPACE_RANGE, buildPackageJson, internalDependencyNames } from './package-json';
import { buildProjectJson, buildTsconfigs, ngPackageFile } from './project-config';
import type { PackageSpec } from './spec';

const FILES = join(__dirname, 'files');

function internalDependencies(tree: Tree, spec: PackageSpec): Record<string, string> {
  const found: Record<string, string> = {};
  for (const name of internalDependencyNames(spec)) {
    const root = name.endsWith('-core') ? `packages/${name.replace('-core', '')}/core` : `packages/${name}`;
    if (tree.exists(`${root}/package.json`)) found[`@cocokits/${name}`] = WORKSPACE_RANGE;
  }
  return found;
}

function templateFolders(spec: PackageSpec): string[] {
  if (spec.type === 'tool') return ['common', 'tool'];
  const folders = ['common', spec.rootEntry ? 'test-root-entry' : 'test-no-root'];
  const ng = spec.builder === 'ng-packagr';
  if (spec.rootEntry || ng) folders.push('src-index');
  else folders.push(spec.shape === 'root-subdirs' ? 'placeholder-root' : 'src-placeholder');
  if (spec.builder === 'tsdown') folders.push('build-tsdown');
  if (spec.builder === 'vite-vue') folders.push('build-vite-vue');
  if (ng) folders.push('build-ng');
  if (spec.css) folders.push('theme');
  return folders;
}

function tsdownEntry(spec: PackageSpec): { entry: string; tsdownRoot: string } {
  const ext = spec.framework === 'react' ? '{ts,tsx}' : 'ts';
  switch (spec.shape) {
    case 'src-subdirs':
      return { entry: `'src/*/index.${ext}', 'src/placeholder.ts'`, tsdownRoot: 'src' };
    case 'root-subdirs':
      return { entry: `'*/index.${ext}', 'placeholder.ts'`, tsdownRoot: '.' };
    default:
      return { entry: `'src/index.${ext}'`, tsdownRoot: 'src' };
  }
}

function substitutions(spec: PackageSpec, offset: string): Record<string, unknown> {
  const excludes = [
    '**/node_modules/**',
    '**/dist/**',
    ...(spec.nested ? ['core/**'] : []),
    ...(spec.type === 'tool' ? ['**/tmp/**'] : []),
  ];
  return {
    ...spec,
    offset,
    ngPackage: ngPackageFile(spec).replace('.json', ''),
    ...tsdownEntry(spec),
    excludes: excludes.map((glob) => `'${glob}'`).join(', '),
    tmpl: '',
  };
}

/**
 * Writes a new package. Returns false (and writes nothing) when the project already exists,
 * so a rerun never overwrites edits.
 */
export function scaffoldPackage(tree: Tree, spec: PackageSpec, compat: Compatibility | undefined): boolean {
  if (tree.exists(`${spec.root}/project.json`)) return false;
  const offset = offsetFromRoot(spec.root);
  const context = { compat, internal: internalDependencies(tree, spec), offset };
  writeJson(tree, `${spec.root}/project.json`, buildProjectJson(spec, offset));
  writeJson(tree, `${spec.root}/package.json`, buildPackageJson(spec, context));
  for (const [file, content] of Object.entries(buildTsconfigs(spec, offset))) {
    writeJson(tree, joinPathFragments(spec.root, file), content);
  }
  for (const folder of templateFolders(spec)) {
    generateFiles(tree, join(FILES, folder), spec.root, substitutions(spec, offset));
  }
  return true;
}
