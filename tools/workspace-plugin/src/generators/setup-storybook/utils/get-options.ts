import { Tree } from '@nx/devkit';

import { posixPath } from '../../../utils/path';
import { getLibraryFrameworkByName, getLibraryRootByName } from '../../generator.utils';
import { SetupStorybookOption } from '../model';
import { SetupStorybookGeneratorSchema } from '../schema';

export function getOptions(tree: Tree, schema: SetupStorybookGeneratorSchema): SetupStorybookOption {
  const libraryRoot = getLibraryRootByName(tree, schema.project);
  const options: SetupStorybookOption = {
    libraryName: schema.project,
    libraryRoot,
    offsetPathToRoot: posixPath.relative(libraryRoot, './'),
    framework: getLibraryFrameworkByName(tree, schema.project),
    projectJson: posixPath.join(libraryRoot, 'project.json'),
    eslintrcJson: posixPath.join(libraryRoot, '.eslintrc.json'),
    tsconfigJson: posixPath.join(libraryRoot, 'tsconfig.json'),
    tsconfigLibJson: posixPath.join(libraryRoot, 'tsconfig.lib.json'),
  };

  return options;
}
