import { Tree } from '@nx/devkit';

export interface UiCoreComponentGeneratorOptions {
  tree: Tree;

  componentName: {
    className: string; // `FormField`
    propertyName: string; // `formField`
    constantName: string; // `FORM_FIELD`
    fileName: string; // `form-field`,
  };
  libraryName: {
    className: string; // `FormField`
    propertyName: string; // `formField`
    constantName: string; // `FORM_FIELD`
    fileName: string; // `form-field`,
  };
  angularLibrary: {
    name: string; // Example: @cocokits/angular-form-field
    libraryPath: string; // Example: packages/angular/form-field
    componentPath: string; // Example: packages/angular/form-field/src/lib
  };
  reactLibrary: {
    name: string; // Example: @cocokits/react-form-field
    libraryPath: string; // Example: packages/angular/form-field
    componentPath: string; // Example: packages/angular/form-field/src/lib
  };

  newLibrary: boolean; // Whether to create a new library or add to an existing one

  // Files Core path
  uiBaseComponentsNameFilePath: string;
  generatorSchemaFilePath: string;
  classNamesFolderPath: string;
  layoutClassNamesConfigFilePath: string;
  classNameMapFilePath: string;

  // Files Themes path
  cocokitsThemeConfigFilePath: string;
  cocokitsStylesFilePath: string;
  cocokitsAllStylesFilePath: string;
  cocokitsIndexStylesFilePath: string;

  framesXThemeConfigFilePath: string;
  framesXStylesFilePath: string;
  framesXAllStylesFilePath: string;
  framesXIndexStylesFilePath: string;

  // Library
  angularComponentPackageJsonPath: string;
  reactComponentPackageJsonPath: string;

  // Component
  angularDocAdvanceConfigurationFilePath: string;
  reactDocAdvanceConfigurationFilePath: string;

  // Storybook
  angularStorybookFolderPath: string;
  reactStorybookFolderPath: string;
}
