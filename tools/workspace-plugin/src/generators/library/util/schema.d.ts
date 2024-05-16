import { LibraryFramework } from '../libarary-generator.model';

export interface UtilLibraryGeneratorSchema {
  name: string;
  framework: LibraryFramework;
  directory: string;
}
