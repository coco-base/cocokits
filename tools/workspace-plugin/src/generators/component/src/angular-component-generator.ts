import { generateFiles, Tree } from '@nx/devkit';
import path from 'path';

import { Logger } from '../../../utils/logger';
import { updateTextFile } from '../../generator.utils';
import { ComponentGeneratorOptions } from '../model';

export function angularComponentGenerator(tree: Tree, options: ComponentGeneratorOptions) {
  // Generate component
  generateFiles(tree, path.join(__dirname, '../files/angular-component'), options.absoluteComponentDirectory, options);

  // Update index.ts
  if (options.export) {
    const componentDirectoryFromSrc = path.relative(
      path.join(options.libraryRoot, 'src'),
      options.absoluteComponentDirectory
    );
    const exportComponent = `export * from './${componentDirectoryFromSrc}/${options.fileName}.component';`;
    updateTextFile(tree, path.join(options.libraryRoot, 'src/index.ts'), (content) => `${content}\n${exportComponent}`);
  }

  // Generate story
  if (options.story) {
    const storyDir = path.join(options.libraryRoot, 'stories', options.fileName);
    generateFiles(tree, path.join(__dirname, '../files/angular-story'), storyDir, options);
  }

  Logger.note(`Manually Check list`);
  Logger.note(`Theme Core`);
  Logger.log(`1- Update 'UIComponentsName' from 'packages/common/core/src/lib/model/ui-component.model.ts'`);
  Logger.log(
    `2- Generate '${options.fileName}-class-names.ts' in 'packages/common/core/src/lib/class-names' directory`
  );
  Logger.log(
    `3- Update 'layoutClassNamesConfig' from 'packages/common/core/src/lib/class-names/layout-class-names-config.ts'`
  );
  Logger.log(`4- Update 'CLASS_NAMES_FN_MAP' from 'packages/common/core/src/lib/class-names/class-names.ts'`);
  Logger.note(`Theme Default`);
  Logger.log(
    `1- Update theme 'cocokitsUIComponentConfig' from 'packages/themes/default/src/config/ui-component-props.config.ts'`
  );
  Logger.log(`2- generate '${options.fileName}.scss' in 'packages/themes/default/src/styles/components' directory`);
  Logger.log(`3- Update export list from 'packages/themes/default/src/styles.scss'`);
  Logger.note(`Theme FramesX`);
  Logger.log(
    `1- Update theme 'framesXUIComponentConfig' from 'packages/themes/frames-x/src/config/ui-component-props.config.ts'`
  );
  Logger.log(`2- generate '${options.fileName}.scss' in 'packages/themes/frames-x/src/styles/components' directory`);
  Logger.log(`3- Update export list from 'packages/themes/frames-x/src/styles.scss'`);
}
