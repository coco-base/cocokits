import { formatFiles, Tree } from '@nx/devkit';

import { ComponentGeneratorSchema } from './schema';
import { angularComponentGenerator } from './src/angular-component-generator';
import { reactComponentGenerator } from './src/react-component-generator';
import { getOptions } from './utils/get-options';
import { LibraryFramework } from '../generator.model';

export async function componentGenerator(tree: Tree, schema: ComponentGeneratorSchema) {
  const options = getOptions(tree, schema);

  switch (options.framework) {
    case LibraryFramework.Angular:
      await angularComponentGenerator(tree, options);
      break;

    case LibraryFramework.React:
      await reactComponentGenerator(tree, options);
      break;

    default:
      throw new Error(`The generator doesn't support create component for '${options.framework}' framework right now`);
  }

  await formatFiles(tree);
}

export default componentGenerator;
