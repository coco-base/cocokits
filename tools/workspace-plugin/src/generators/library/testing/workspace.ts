import { readJson, type GeneratorCallback, type Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import libraryGenerator from '../generator';
import type { LibraryGeneratorSchema } from '../schema';

/** Deliberately different from the real compatibility.json: peers must be derived, never hard-coded. */
export const TEST_COMPATIBILITY = {
  peers: {
    '@angular/core': { low: '20.1.0', high: '20.4.2' },
    react: { low: '18.2.0', high: '19.1.0' },
    'react-dom': { low: '18.2.0', high: '19.1.0' },
    vue: { low: '3.4.0', high: '3.4.9' },
  },
};

export function createWorkspace(): Tree {
  const tree = createTreeWithEmptyWorkspace();
  tree.write('compatibility.json', JSON.stringify(TEST_COMPATIBILITY));
  tree.write('.changeset/config.json', JSON.stringify({ fixed: [['@cocokits/*']] }));
  return tree;
}

export async function generate(tree: Tree, options: LibraryGeneratorSchema): Promise<GeneratorCallback> {
  return libraryGenerator(tree, options);
}

/** Every file of the tree with its content, to compare runs. */
export function snapshot(tree: Tree): Record<string, string> {
  const files: Record<string, string> = {};
  for (const change of tree.listChanges()) files[change.path] = change.content?.toString() ?? '';
  return files;
}

/** Subset of a package.json the tests look at. */
export interface PackageJson {
  name: string;
  version: string;
  type: string;
  sideEffects: boolean | string[];
  files?: string[];
  exports: Record<string, unknown>;
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  peerDependenciesMeta?: Record<string, { optional: boolean }>;
  publishConfig: { access: string; directory?: string };
}

export function readPackage(tree: Tree, root: string): PackageJson {
  return readJson<PackageJson>(tree, `${root}/package.json`);
}

export function readTags(tree: Tree, root: string): string[] {
  return readJson<{ tags: string[] }>(tree, `${root}/project.json`).tags;
}

export function tsconfigPaths(tree: Tree): Record<string, string[]> {
  return readJson<{ compilerOptions: { paths: Record<string, string[]> } }>(tree, 'tsconfig.base.json').compilerOptions
    .paths;
}

export function sizeEntries(tree: Tree): string[] {
  const content = tree.read('size-limit.config.mjs', 'utf-8') ?? '';
  return [...content.matchAll(/name: '([^']+)'/g)].map((match) => match[1] ?? '');
}

export function rootDevDependencies(tree: Tree): Record<string, string> {
  return readJson<{ devDependencies: Record<string, string> }>(tree, 'package.json').devDependencies;
}

export function missingFiles(tree: Tree, root: string, files: readonly string[]): string[] {
  return files.filter((file) => !tree.exists(`${root}/${file}`));
}

export const COMMON_FILES = [
  'project.json',
  'package.json',
  'tsconfig.json',
  'tsconfig.lib.json',
  'tsconfig.spec.json',
  'eslint.config.mjs',
  'vitest.config.mjs',
  'README.md',
] as const;
