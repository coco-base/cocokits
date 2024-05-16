import { formatFiles, names, Tree } from '@nx/devkit';
import { UiLibraryGeneratorSchema } from './schema';
import { LibraryFramework, LibraryGeneratorOptions, LibraryType } from '../libarary-generator.model';
import {
  angularLibraryGenerator,
  reactLibraryGenerator,
  sharedLibraryGenerator,
  webLibraryGenerator,
} from '../library-generator.util';

export default async function uiLibraryGenerator(tree: Tree, options: UiLibraryGeneratorSchema) {
  const libraryDirectory = `packages/${options.framework}`;
  const libraryOptions: LibraryGeneratorOptions = {
    ...options,
    ...names(options.name),
    type: LibraryType.Ui,
    directory: libraryDirectory,
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
