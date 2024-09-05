import { generateFiles, Tree, updateJson } from '@nx/devkit';
import path from 'path';

import { deepMerge } from '@cocokits/common-utils';

import { SetupStorybookOption } from '../model';
import { getEslintrcChanges } from '../utils/get-eslintrc-changes';
import { getAngularProjectJsonChanges } from '../utils/get-project-json-changes';
import { getTsconfigJsonChanges, getTsconfigLibJsonChanges } from '../utils/get-tsconfig-changes';

export function setupAngularStorybook(tree: Tree, options: SetupStorybookOption) {
  // Generate `.storybook` folder
  generateFiles(tree, path.join(__dirname, '../files/angular'), options.libraryRoot, options);

  // Update `.eslintrc.json`
  updateJson(tree, options.eslintrcJson, (json) => deepMerge(json, getEslintrcChanges()));

  // Update `project.json`
  updateJson(tree, options.projectJson, (json) => deepMerge(json, getAngularProjectJsonChanges(options)));

  // Update `tsconfig.json`
  updateJson(tree, options.tsconfigJson, (json) => deepMerge(json, getTsconfigJsonChanges()));

  // Update `tsconfig.lib.json`
  updateJson(tree, options.tsconfigLibJson, (json) => deepMerge(json, getTsconfigLibJsonChanges()));
}
