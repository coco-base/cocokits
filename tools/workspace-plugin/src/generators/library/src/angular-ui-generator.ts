import { generateFiles, Tree, updateJson } from '@nx/devkit';

import { deepMerge } from '@cocokits/common-utils';

import { posixPath } from '../../../utils/path';
import { LibraryGeneratorOptions } from '../model';
import { getTsconfigJsonChanges, getTsconfigStorybookManagerJsonChanges } from '../utils/get-tsconfig-changes';

export function angularUiGenerator(tree: Tree, options: LibraryGeneratorOptions) {
  // Generate angular library
  generateFiles(tree, posixPath.join(__dirname, '../files/angular-ui'), options.libraryRoot, options);

  // Update `tsconfig.base.json`
  updateJson(tree, options.tsconfigBase, (json) => deepMerge(json, getTsconfigJsonChanges(options)));

  // Update `tsconfig.storybook-manager-paths.json`
  updateJson(tree, options.tsconfigStorybookManager, (json) =>
    deepMerge(json, getTsconfigStorybookManagerJsonChanges(options))
  );
}
