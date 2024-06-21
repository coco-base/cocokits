import { formatFiles, generateFiles, names, Tree } from '@nx/devkit';
import path from 'path';

import { AngularComponentGeneratorSchema } from './schema';
import { ComponentFramework, ComponentGeneratorOptions } from '../component-generator.model';
import {
  getComponentImportPath,
  getComponentSelector,
  getProjectRoot,
  updateIndexFile,
} from '../component-generator.util';

export default async function angularComponentGenerator(tree: Tree, options: AngularComponentGeneratorSchema) {
  const componentGeneratorOptions: ComponentGeneratorOptions = {
    ...options,
    ...names(options.name),
    projectRoot: getProjectRoot(tree, options.project, ComponentFramework.Angular),
    framework: ComponentFramework.Angular,
  };

  generateComponent(tree, componentGeneratorOptions);

  if (componentGeneratorOptions.story) {
    generateStoryComponent(tree, componentGeneratorOptions);
  }

  updateIndexFile(tree, componentGeneratorOptions);

  await formatFiles(tree);
}

function generateComponent(tree: Tree, componentOptions: ComponentGeneratorOptions) {
  generateFiles(
    tree,
    path.join(__dirname, 'templates', 'component'),
    path.join(componentOptions.projectRoot, 'src', 'lib', componentOptions.subDirectory, componentOptions.fileName),
    {
      ...componentOptions,
      selector: getComponentSelector(componentOptions),
    }
  );
}

function generateStoryComponent(tree: Tree, componentOptions: ComponentGeneratorOptions) {
  generateFiles(
    tree,
    path.join(__dirname, 'templates', 'storybook'),
    path.join(componentOptions.projectRoot, 'stories', componentOptions.fileName),
    {
      ...componentOptions,
      componentImportPath: getComponentImportPath(componentOptions),
    }
  );
}
