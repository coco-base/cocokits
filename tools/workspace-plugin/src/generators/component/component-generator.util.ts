import { readProjectConfiguration, Tree } from '@nx/devkit';
import path from 'path';

import { ComponentFramework, ComponentGeneratorOptions } from './component-generator.model';

export function getProjectRoot(tree: Tree, projectName: string, componentFramework: ComponentFramework): string {
  const projectJson = readProjectConfiguration(tree, projectName);
  const frameworkTag = projectJson.tags?.find((tag) => tag.startsWith('framework:'))?.split(':')[1];

  if (frameworkTag !== 'shared' && componentFramework !== frameworkTag) {
    console.log('\x1b[31m' + 'project framework is not compatible with component framework'); // eslint-disable-line no-console
    process.exit(1);
  }

  return projectJson.root;
}

export function getComponentSelector(componentOptions: ComponentGeneratorOptions) {
  switch (componentOptions.framework) {
    case ComponentFramework.Angular:
      return `cck-${componentOptions.fileName}`;
  }
}

export function updateIndexFile(tree: Tree, componentOptions: ComponentGeneratorOptions) {
  const indexFile = path.join(componentOptions.projectRoot, 'src', 'index.ts');
  const originalSourceStr = tree.read(indexFile, 'utf-8');
  const componentExportStr = `export * from './${getComponentImportPath(componentOptions)}';`;
  const newSourceStr = `${originalSourceStr}\n${componentExportStr}`;
  tree.write(path.join(indexFile), newSourceStr);
}

export function getComponentImportPath(componentOptions: ComponentGeneratorOptions) {
  return path.join(
    'lib',
    componentOptions.subDirectory,
    componentOptions.fileName,
    componentOptions.fileName + '.component'
  );
}
