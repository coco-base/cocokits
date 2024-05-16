export enum LibraryFramework {
  Angular = 'angular',
  React = 'react',
  Web = 'web',
  Shared = 'shared',
}

export enum LibraryType {
  Ui = 'ui',
  Util = 'util',
}

export interface LibraryGeneratorOptions {
  name: string;
  className: string;
  propertyName: string;
  constantName: string;
  fileName: string;
  framework: LibraryFramework;
  type: LibraryType;
  directory: string;
}
