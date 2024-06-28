import { readProjectConfiguration, Tree } from '@nx/devkit';

import { LibraryFramework } from './generator.model';

export function getLibraryRootByName(tree: Tree, libraryName: string): string {
  const projectJson = readProjectConfiguration(tree, libraryName);
  return projectJson.root;
}

export function getLibraryFrameworkByName(tree: Tree, libraryName: string): LibraryFramework {
  const projectJson = readProjectConfiguration(tree, libraryName);
  const frameworkTag = projectJson.tags?.find((tag) => tag.startsWith('framework:'))?.split(':')[1];
  return frameworkTag as LibraryFramework;
}
