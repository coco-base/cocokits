import { formatFiles, names, Tree } from '@nx/devkit';

import { UtilLibraryGeneratorSchema } from './schema';
import { LibraryFramework, LibraryGeneratorOptions, LibraryType } from '../libarary-generator.model';
import {
  angularLibraryGenerator,
  reactLibraryGenerator,
  sharedLibraryGenerator,
  webLibraryGenerator,
} from '../library-generator.util';

export default async function utilLibraryGenerator(tree: Tree, options: UtilLibraryGeneratorSchema) {
  const libraryOptions: LibraryGeneratorOptions = {
    ...options,
    ...names(options.name),
    type: LibraryType.Util,
  };

  switch (options.framework) {
    case LibraryFramework.Angular:
      await angularLibraryGenerator(tree, libraryOptions);
      break;
    case LibraryFramework.React:
      await reactLibraryGenerator(tree, libraryOptions);
      break;
    case LibraryFramework.Web:
      await webLibraryGenerator(tree, libraryOptions);
      break;
    case LibraryFramework.Shared:
      await sharedLibraryGenerator(tree, libraryOptions);
      break;
  }

  await formatFiles(tree);
}
