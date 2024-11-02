import { formatFiles, Tree } from '@nx/devkit';

import { SetupFrameworkType } from './model';
import { LibraryGeneratorSchema } from './schema';
import { angularUiGenerator } from './src/angular-ui-generator';
import { reactUiGenerator } from './src/react-ui-generator';
import { getOptions } from './utils/get-options';
import { getSetupFrameworkType } from './utils/get-setup-framework-type';
import { validateSchema } from './utils/validate-schema';
import setupStorybookGenerator from '../setup-storybook/generator';

export async function libraryGenerator(tree: Tree, schema: LibraryGeneratorSchema) {
  validateSchema(schema);
  const options = getOptions(schema, tree.root);
  console.log('🚀 ~ libraryGenerator ~ options:', options);
  const setupFrameworkType = getSetupFrameworkType(options);

  switch (setupFrameworkType) {
    case SetupFrameworkType.Angular:
      angularUiGenerator(tree, options);
      break;

    case SetupFrameworkType.React:
      reactUiGenerator(tree, options);
      break;

    default:
      throw new Error(
        `The generator doesn't support '${options.framework}' framework with '${options.type}' type right now`
      );
  }

  if (options.storybook) {
    await setupStorybookGenerator(tree, {
      project: options.importPath,
    });
  }

  await formatFiles(tree);
}

export default libraryGenerator;
