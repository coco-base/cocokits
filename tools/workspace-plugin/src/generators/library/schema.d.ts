import { LibraryType } from './model';
import { GeneratorDirectoryFormat, LibraryFramework } from '../generator.model';

export interface LibraryGeneratorSchema {
  name: string;
  type: LibraryType;
  framework: LibraryFramework;
  storybook: boolean;
  directory: string;
  directoryFormat: GeneratorDirectoryFormat;
  publishable: boolean;
  importPath: string;
  formatFiles: boolean;
}
