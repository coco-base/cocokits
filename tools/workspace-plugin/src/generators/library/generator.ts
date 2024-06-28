import { formatFiles, Tree } from '@nx/devkit';

import { LibraryType } from './model';
import { LibraryGeneratorSchema } from './schema';
import { angularUiGenerator } from './src/angular-ui-generator';
import { getOptions } from './utils/get-options';
import { validateSchema } from './utils/validate-schema';
import { LibraryFramework } from '../generator.model';
import setupStorybookGenerator from '../setup-storybook/generator';

export async function libraryGenerator(tree: Tree, schema: LibraryGeneratorSchema) {
  validateSchema(schema);
  const options = getOptions(schema, tree.root);

  if (options.framework === LibraryFramework.Angular && options.type === LibraryType.UI) {
    angularUiGenerator(tree, options);
  } else {
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
