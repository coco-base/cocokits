import { generateFiles } from '@nx/devkit';

import { posixPath } from '../../../utils/path';
import { UiCoreComponentGeneratorOptions } from '../model';

export function generateStorybook(options: UiCoreComponentGeneratorOptions) {
  // Angular
  generateFiles(
    options.tree,
    posixPath.join(__dirname, '../files/angular-storybook'),
    options.angularStorybookFolderPath,
    options
  );

  // React
  generateFiles(
    options.tree,
    posixPath.join(__dirname, '../files/react-storybook'),
    options.reactStorybookFolderPath,
    options
  );
}
