import { generateFiles, Tree } from '@nx/devkit';

import { posixPath } from '../../../utils/path';
import { updateTextFile } from '../../generator.utils';
import { ComponentGeneratorOptions } from '../model';

export function angularComponentGenerator(tree: Tree, options: ComponentGeneratorOptions) {
  // Generate component
  generateFiles(
    tree,
    posixPath.join(__dirname, '../files/angular-component'),
    options.absoluteComponentDirectory,
    options
  );

  // Update index.ts
  if (options.export) {
    const componentDirectoryFromSrc = posixPath.relative(
      posixPath.join(options.libraryRoot, 'src'),
      options.absoluteComponentDirectory
    );
    const exportComponent = `export * from './${componentDirectoryFromSrc}/${options.fileName}.component';`;
    updateTextFile(
      tree,
      posixPath.join(options.libraryRoot, 'src/index.ts'),
      (content) => `${content}\n${exportComponent}`
    );
  }

  // Generate story
  if (options.story) {
    const storyDir = posixPath.join(options.libraryRoot, 'stories', options.fileName);
    generateFiles(tree, posixPath.join(__dirname, '../files/angular-story'), storyDir, options);
  }
}
