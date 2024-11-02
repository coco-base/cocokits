import { LibraryFramework } from '../generator.model';

export interface LibraryGeneratorOptions {
  name: string; // Original name, same as schema name
  className: string; // `my-name` or `myName` -> `MyName`
  propertyName: string; // `my-name` or `myName` -> `myName`
  constantName: string; // `my-name` or `myName` -> `MY_NAME`
  fileName: string; // `my-name` or `myName` -> `my-name`
  type: LibraryType;
  framework: LibraryFramework;
  storybook: boolean;
  publishable: boolean;
  importPath: string;
  libraryRoot: string; // Will be generated bas on `directoryFormat` and `directory`
  offsetPathToRoot: string; // For Example: `../../..`
  tsconfigBase: string;
  tsconfigStorybookManager: string;
}

export enum LibraryType {
  /**
   * A User Interface (UI) library.
   */
  UI = 'ui',

  /**
   * A utility library with reusable functions and helpers.
   */
  Utils = 'utils',

  /**
   * A theme library for styling and appearance.
   * Limitation: The framework must be 'shared'.
   */
  Theme = 'theme',
}

export enum SetupFrameworkType {
  Angular = 'angular',
  React = 'react',
}
