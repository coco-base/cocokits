import { generateFiles, Tree } from '@nx/devkit';
import path from 'path';

import { updateTextFile } from '../../generator.utils';
import { ComponentGeneratorOptions } from '../model';
import { Logger } from '../../../utils/logger';

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
  Logger.log(
    `[] Generate '${options.fileName}-class-names.ts' in 'packages/themes/core/src/lib/class-names' directory`
  );
  Logger.log(`[] export '${options.fileName}-class-names.ts' from 'packages/themes/core/src/index.ts'`);
  Logger.log(`[] Update 'UIComponentsName' from 'packages/themes/core/src/lib/model/ui-component.model.ts'`);
  Logger.log(
    `[] Update 'layoutClassNamesConfig' from 'packages/themes/core/src/lib/class-names/layout-class-names-config.ts'`
  );
  Logger.note(`Theme Default`);
  Logger.log(
    `[] Update theme 'cocokitsUIComponentConfig' from 'packages/themes/default/src/config/ui-component-props.config.ts'`
  );
  Logger.log(`[] generate '${options.fileName}.scss' in 'packages/themes/default/src/styles/components' directory`);
  Logger.log(`[] Update export list from 'packages/themes/default/src/styles.scss'`);
  Logger.note(`Theme FrameX`);
  Logger.log(
    `[] Update theme 'frameXUIComponentConfig' from 'packages/themes/frame-x/src/config/ui-component-props.config.ts'`
  );
  Logger.log(`[] generate '${options.fileName}.scss' in 'packages/themes/frame-x/src/styles/components' directory`);
  Logger.log(`[] Update export list from 'packages/themes/frame-x/src/styles.scss'`);
}
