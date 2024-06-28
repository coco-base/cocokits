import { formatFiles, Tree } from '@nx/devkit';

import { SetupStorybookGeneratorSchema } from './schema';
import { setupAngularStorybook } from './src/setup-angular-storybook';
import { getOptions } from './utils/get-options';
import { LibraryFramework } from '../generator.model';

export async function setupStorybookGenerator(tree: Tree, schema: SetupStorybookGeneratorSchema) {
  const options = getOptions(tree, schema);

  switch (options.framework) {
    case LibraryFramework.Angular:
      setupAngularStorybook(tree, options);
      break;

    default:
      throw new Error(`The generator doesn't support ${options.framework} framework right now`);
  }

  await formatFiles(tree);
}

export default setupStorybookGenerator;
