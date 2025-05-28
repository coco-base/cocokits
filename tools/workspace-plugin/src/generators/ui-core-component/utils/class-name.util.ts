import { generateFiles } from '@nx/devkit';

import { posixPath } from '../../../utils/path';
import { UiCoreComponentGeneratorOptions } from '../model';

export function generateClassNameFile(options: UiCoreComponentGeneratorOptions) {
  generateFiles(options.tree, posixPath.join(__dirname, '../files/class-name'), options.classNamesFolderPath, options);
}
