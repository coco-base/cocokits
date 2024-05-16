import { CckLibraryFramework, CckLibraryType } from './library-generator.model';

export interface LibraryGeneratorSchema {
  name: string;
  type: CckLibraryType;
  framework: CckLibraryFramework;
}

export interface LibraryGeneratorOptions extends LibraryGeneratorSchema {
  className: string;
  propertyName: string;
  constantName: string;
  fileName: string;
}
