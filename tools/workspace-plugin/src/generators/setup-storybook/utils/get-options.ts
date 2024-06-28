import { Tree } from '@nx/devkit';
import path from 'path';

import { getLibraryFrameworkByName, getLibraryRootByName } from '../../generator.utils';
import { SetupStorybookOption } from '../model';
import { SetupStorybookGeneratorSchema } from '../schema';

export function getOptions(tree: Tree, schema: SetupStorybookGeneratorSchema): SetupStorybookOption {
  const libraryRoot = getLibraryRootByName(tree, schema.project);
  const options: SetupStorybookOption = {
    libraryName: schema.project,
    libraryRoot,
    offsetPathToRoot: path.relative(libraryRoot, './'),
    framework: getLibraryFrameworkByName(tree, schema.project),
    projectJson: path.join(libraryRoot, 'project.json'),
    eslintrcJson: path.join(libraryRoot, '.eslintrc.json'),
    tsconfigJson: path.join(libraryRoot, 'tsconfig.json'),
    tsconfigLibJson: path.join(libraryRoot, 'tsconfig.lib.json'),
  };

  return options;
}
