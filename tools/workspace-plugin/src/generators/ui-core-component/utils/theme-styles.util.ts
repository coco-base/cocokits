import { generateFiles } from '@nx/devkit';

import { posixPath } from '../../../utils/path';
import { UiCoreComponentGeneratorOptions } from '../model';

export function generateThemeStyles(options: UiCoreComponentGeneratorOptions) {
  // Cocokits
  generateFiles(
    options.tree,
    posixPath.join(__dirname, '../files/theme-styles'),
    options.cocokitsStylesFilePath,
    options
  );

  // FramesX
  generateFiles(
    options.tree,
    posixPath.join(__dirname, '../files/theme-styles'),
    options.framesXStylesFilePath,
    options
  );
}
