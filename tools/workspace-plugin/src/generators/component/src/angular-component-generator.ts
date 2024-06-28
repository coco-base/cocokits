import { generateFiles, Tree } from '@nx/devkit';
import path from 'path';

import { updateTextFile } from '../../generator.utils';
import { ComponentGeneratorOptions } from '../model';

export function angularComponentGenerator(tree: Tree, options: ComponentGeneratorOptions) {
  // Generate component
  generateFiles(tree, path.join(__dirname, '../files/angular-component'), options.absoluteComponentDirectory, options);

  // Update index.ts
  const componentDirectoryFromSrc = path.relative(
    path.join(options.libraryRoot, 'src'),
    options.absoluteComponentDirectory
  );
  const exportComponent = `export * from './${componentDirectoryFromSrc}/${options.fileName}.component';`;
  updateTextFile(tree, path.join(options.libraryRoot, 'src/index.ts'), (content) => `${content}\n${exportComponent}`);

  // Generate story
  if (options.story) {
    const storyDir = path.join(options.libraryRoot, 'stories', options.fileName);
    generateFiles(tree, path.join(__dirname, '../files/angular-story'), storyDir, options);
  }
}
