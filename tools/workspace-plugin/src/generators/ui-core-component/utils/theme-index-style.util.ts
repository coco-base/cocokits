import { errorMessages } from './errors';
import { UiCoreComponentGeneratorOptions } from '../model';

export function updateThemeIndexStylesFile(options: UiCoreComponentGeneratorOptions) {
  // Cocokits
  const cocoKitsFileContent = options.tree.read(options.cocokitsIndexStylesFilePath, 'utf-8');

  if (!cocoKitsFileContent) {
    throw new Error(errorMessages.indexStyles.notFoundOrEmptyCocokits(options));
  }

  // Forward path
  cocoKitsFileContent.replace(
    /(@forward[\s\S]+?;)(?![\s\S]*@forward)/,
    `$1\n@forward './${options.componentName.fileName}' as components_*;\n`
  );

  options.tree.write(options.cocokitsIndexStylesFilePath, cocoKitsFileContent);

  // FramesX
  const framesXFileContent = options.tree.read(options.framesXIndexStylesFilePath, 'utf-8');

  if (!framesXFileContent) {
    throw new Error(errorMessages.indexStyles.notFoundOrEmptyFramesX(options));
  }

  // Forward path
  framesXFileContent.replace(
    /(@forward[\s\S]+?;)(?![\s\S]*@forward)/,
    `$1\n@forward './${options.componentName.fileName}' as components_*;\n`
  );

  options.tree.write(options.framesXIndexStylesFilePath, cocoKitsFileContent);
}
