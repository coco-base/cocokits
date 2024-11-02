import { generateFiles, Tree, updateJson } from '@nx/devkit';

import { deepMerge } from '@cocokits/common-utils';

import { posixPath } from '../../../utils/path';
import { SetupStorybookOption } from '../model';
import { getEslintrcChanges } from '../utils/get-eslintrc-changes';
import { getReactTsconfigJsonChanges } from '../utils/get-tsconfig-changes';

export function setupReactStorybook(tree: Tree, options: SetupStorybookOption) {
  // Generate `.storybook` folder and `tsconfig.storybook.json`
  generateFiles(tree, posixPath.join(__dirname, '../files/react'), options.libraryRoot, options);

  // Update `.eslintrc.json`
  updateJson(tree, options.eslintrcJson, (json) => deepMerge(json, getEslintrcChanges()));

  // Update `tsconfig.json`
  updateJson(tree, options.tsconfigJson, (json) => deepMerge(json, getReactTsconfigJsonChanges()));
}
