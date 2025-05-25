import { errorMessages } from './errors';
import { UiCoreComponentGeneratorOptions } from '../model';

export function updateThemeConfigs(options: UiCoreComponentGeneratorOptions) {
  // Cocokits
  let cocoKitsFileContent = options.tree.read(options.cocokitsThemeConfigFilePath, 'utf-8');
  if (!cocoKitsFileContent) {
    throw new Error(errorMessages.themeConfig.notFoundOrEmptyCocokits(options));
  }

  cocoKitsFileContent = cocoKitsFileContent.replace(
    /(const components.*=\s*{[\s\S]*?)(\s*};)/gm,
    `$1\n${options.componentName.propertyName}: {},$2`
  );

  options.tree.write(options.cocokitsThemeConfigFilePath, cocoKitsFileContent);

  // FramesX
  let framesXFileContent = options.tree.read(options.framesXThemeConfigFilePath, 'utf-8');
  if (!framesXFileContent) {
    throw new Error(errorMessages.themeConfig.notFoundOrEmptyFramesX(options));
  }

  framesXFileContent = framesXFileContent.replace(
    /(const components.*=\s*{[\s\S]*?)(\s*};)/gm,
    `$1\n${options.componentName.propertyName}: {},$2`
  );

  options.tree.write(options.framesXThemeConfigFilePath, framesXFileContent);
}
