import { LibraryType } from '../model';
import { LibraryGeneratorSchema } from '../schema';
import { LibraryFramework } from '../../generator.model';

export function validateSchema(options: LibraryGeneratorSchema): void {
  // 'theme' requires 'shared' as the framework
  if (options.type === LibraryType.Theme && options.framework !== LibraryFramework.Shared) {
    throw new Error("A 'theme' type library must use the 'shared' framework.");
  }

  // 'angular' and 'react' cannot have 'theme' as a type
  if (options.framework === LibraryFramework.Angular || options.framework === LibraryFramework.React) {
    if (options.type === LibraryType.Theme) {
      throw new Error(`${options.framework} framework cannot be used with 'theme' type.`);
    }
  }

  // 'shared' cannot be used with 'ui' type
  if (options.framework === LibraryFramework.Shared && options.type === LibraryType.UI) {
    throw new Error("The 'shared' framework cannot be used with 'ui' type.");
  }

  // 'storybook' framework must use 'utils' type
  if (options.framework === LibraryFramework.Storybook && options.type !== LibraryType.Utils) {
    throw new Error("The 'storybook' framework can only be used with 'utils' type.");
  }
}
