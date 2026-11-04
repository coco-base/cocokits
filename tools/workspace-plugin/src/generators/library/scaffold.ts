import { generateFiles, joinPathFragments, offsetFromRoot, writeJson, type Tree } from '@nx/devkit';
import { join } from 'node:path';
import type { Compatibility } from './compat';
import { WORKSPACE_RANGE, buildPackageJson, internalDependencyNames } from './package-json';
import { buildProjectJson, buildTsconfigs, ngPackageFile, previewBaseHref } from './project-config';
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

/** A tool has a placeholder source, or the root entry and its test when other projects import it (`docs-shared`). */
function toolFolders(spec: PackageSpec): string[] {
  return spec.rootEntry ? ['common', 'src-index', 'test-root-entry'] : ['common', 'tool'];
}

/** The folders of an app or of the e2e project; undefined for every other kind. */
function appFolders(spec: PackageSpec): string[] | undefined {
  if (spec.kind === 'docs-e2e') return ['app-docs-e2e'];
  if (spec.kind === 'app') {
    if (spec.framework === undefined) return ['common', 'app-docs'];
    return spec.framework === 'angular'
      ? ['common', 'app-preview-angular']
      : ['common', 'app-preview-vite', `app-preview-${spec.framework}`];
  }
  return undefined;
}

function templateFolders(spec: PackageSpec): string[] {
  const app = appFolders(spec);
  if (app !== undefined) return app;
  if (spec.type === 'tool') return toolFolders(spec);
  const folders = ['common', spec.rootEntry ? 'test-root-entry' : 'test-no-root'];
  const ng = spec.builder === 'ng-packagr';
  if (spec.rootEntry || ng) folders.push('src-index');
  else folders.push(spec.shape === 'root-subdirs' ? 'placeholder-root' : 'src-placeholder');
  if (spec.builder === 'tsdown') folders.push('build-tsdown');
  if (spec.builder === 'vite-vue') folders.push('build-vite-vue');
  if (ng) folders.push('build-ng');
  if (ng && !spec.rootEntry && spec.kind === 'fw') folders.push('ng-no-root');
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

/** The vite config and the index page of the React and Vue preview apps differ in these values only. */
function viteAppSubstitutions(spec: PackageSpec): Record<string, unknown> {
  if (spec.kind !== 'app' || spec.framework === undefined || spec.framework === 'angular') return {};
  return spec.framework === 'react'
    ? {
        mainFile: 'src/main.tsx',
        pluginImport: "import react from '@vitejs/plugin-react';",
        pluginCall: 'react()',
        baseHref: previewBaseHref(spec.framework),
      }
    : {
        mainFile: 'src/main.ts',
        pluginImport: "import vue from '@vitejs/plugin-vue';",
        pluginCall: 'vue()',
        baseHref: previewBaseHref(spec.framework),
      };
}

function substitutions(spec: PackageSpec, offset: string): Record<string, unknown> {
  const excludes = [
    '**/node_modules/**',
    '**/dist/**',
    ...(spec.nested ? ['core/**'] : []),
    ...(spec.type === 'tool' ? ['**/tmp/**'] : []),
    ...(spec.kind === 'app' ? ['**/.astro/**', '**/.angular/**'] : []),
  ];
  return {
    ...spec,
    offset,
    ngPackage: ngPackageFile(spec).replace('.json', ''),
    ...tsdownEntry(spec),
    ...viteAppSubstitutions(spec),
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
