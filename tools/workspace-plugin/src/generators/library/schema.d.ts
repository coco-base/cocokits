import { CckLibraryFramework, CckLibraryType } from './library-generator.model';

export interface LibraryGeneratorSchema {
  name: string;
  type: CckLibraryType;
  framework: CckLibraryFramework;
}
