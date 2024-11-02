import { LibraryFramework } from '../../generator.model';
import { LibraryGeneratorOptions, LibraryType, SetupFrameworkType } from '../model';

export function getSetupFrameworkType(options: LibraryGeneratorOptions): SetupFrameworkType | null {
  if (options.framework === LibraryFramework.Angular && options.type === LibraryType.UI) {
    return SetupFrameworkType.Angular;
  }

  if (options.framework === LibraryFramework.React && options.type === LibraryType.UI) {
    return SetupFrameworkType.React;
  }

  return null;
}
