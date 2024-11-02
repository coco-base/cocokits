import { generateFiles, Tree, updateJson } from '@nx/devkit';

import { deepMerge } from '@cocokits/common-utils';

import { Logger } from '../../../utils/logger';
import { posixPath } from '../../../utils/path';
import { LibraryGeneratorOptions } from '../model';
import { getTsconfigJsonChanges, getTsconfigStorybookManagerJsonChanges } from '../utils/get-tsconfig-changes';

export function reactUiGenerator(tree: Tree, options: LibraryGeneratorOptions) {
  // Generate react library
  generateFiles(tree, posixPath.join(__dirname, '../files/react-ui'), options.libraryRoot, options);

  // Update `tsconfig.base.json`
  updateJson(tree, options.tsconfigBase, (json) => deepMerge(json, getTsconfigJsonChanges(options)));

  // Update `tsconfig.storybook-manager-paths.json`
  updateJson(tree, options.tsconfigStorybookManager, (json) =>
    deepMerge(json, getTsconfigStorybookManagerJsonChanges(options))
  );

  Logger.note(`Manually Check list`);
  Logger.note(`Exports`);
  Logger.log(`[] Update 'package.json' from 'packages/react/components/package.json'`);
}
