import { LibraryFramework } from '../generator.model';

export interface ComponentGeneratorOptions {
  name: string; // Original name, same as schema name
  className: string; // `my-name` or `myName` -> `MyName`
  propertyName: string; // `my-name` or `myName` -> `myName`
  constantName: string; // `my-name` or `myName` -> `MY_NAME`
  fileName: string; // `my-name` or `myName` -> `my-name`,
  framework: LibraryFramework;
  story: boolean;
  libraryRoot: string;
  absoluteComponentDirectory: string; // packages/angular/icon/src/lib/svg-icon
  relativeComponentDirectory: string; // src/lib/svg-icon
}
