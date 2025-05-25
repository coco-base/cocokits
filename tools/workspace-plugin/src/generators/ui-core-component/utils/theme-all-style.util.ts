import { errorMessages } from './errors';
import { UiCoreComponentGeneratorOptions } from '../model';

export function updateThemeAllStylesFile(options: UiCoreComponentGeneratorOptions) {
  // Cocokits
  const cocoKitsFileContent = options.tree.read(options.cocokitsAllStylesFilePath, 'utf-8');

  if (!cocoKitsFileContent) {
    throw new Error(errorMessages.allStyles.notFoundOrEmptyCocokits(options));
  }

  // Import path
  cocoKitsFileContent.replace(
    /(@use[\s\S]+?;)(?![\s\S]*@use)/,
    `$1\n@use './${options.componentName.fileName}' as *;\n`
  );

  // Update @mixin all
  cocoKitsFileContent.replace(/(@mixin all {.*)(})/, `$1\n@include ${options.componentName.fileName};\n$1$2`);

  options.tree.write(options.cocokitsAllStylesFilePath, cocoKitsFileContent);

  // FramesX
  const framesXFileContent = options.tree.read(options.framesXAllStylesFilePath, 'utf-8');

  if (!framesXFileContent) {
    throw new Error(errorMessages.allStyles.notFoundOrEmptyFramesX(options));
  }

  // Import path
  framesXFileContent.replace(
    /(@use[\s\S]+?;)(?![\s\S]*@use)/,
    `$1\n@use './${options.componentName.fileName}' as *;\n`
  );

  // Update @mixin all
  framesXFileContent.replace(/(@mixin all {.*)(})/, `$1\n@include ${options.componentName.fileName};\n$1$2`);

  options.tree.write(options.framesXAllStylesFilePath, framesXFileContent);
}
