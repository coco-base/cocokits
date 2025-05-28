import { UiCoreComponentGeneratorOptions } from '../model';

const optionsHeader = `Error during parsing options.\n\n`;
const uiBaseComponentsNameHeader = `Error during working with 'ui-base-components-name.ts' file.\n\n`;
const schemaHeader = `Error during working with 'schema.json' file.\n\n`;
const layoutClassNamesConfigHeader = `Error during working with 'layout-class-names-config.ts' file.\n\n`;
const classNamesMapHeader = `Error during working with 'class-names.ts' file.\n\n`;
const themeConfigHeader = `Error during working with 'theme-config.ts' file.\n\n`;
const allStylesHeader = `Error during working with '_all.scss' file.\n\n`;
const indexStylesHeader = `Error during working with '_index.scss' file.\n\n`;
const generateLibraryHeader = `Error during generate library.\n\n`;
const docAdvancedConfigHeader = `Error during working with 'advanced-configuration.utils.tsx' file.\n\n`;

type Options = UiCoreComponentGeneratorOptions;

export const errorMessages = {
  options: {
    bothLibraryNamesProvided: () =>
      `You can not provide both 'exitingLibraryName' and 'newLibraryName'. Please provide only one of them.`,
    noLibraryNameProvided: () => `You must provide either 'exitingLibraryName' or 'newLibraryName'.`,
  },
  uiBaseComponentsName: {
    notFoundOrEmpty: (options: Options) =>
      `${optionsHeader}
      The file ${options.uiBaseComponentsNameFilePath} does not exist or is empty.
    `.trim(),

    noLibraryFounded: (options: Options) =>
      `${uiBaseComponentsNameHeader}
      ${options.libraryName.fileName} library is not registered in the UIBaseComponentsName file.
      Make sure your config is correct and the library is already created.
    `.trim(),

    libraryExist: (options: Options) =>
      `${uiBaseComponentsNameHeader}
      The file ${options.uiBaseComponentsNameFilePath} already contains the '${options.libraryName.className} library'.
      But you are trying to create it again.
    `.trim(),
  },
  schema: {
    notFoundOrEmpty: (options: Options) => `${schemaHeader}
      The file ${options.generatorSchemaFilePath} does not exist or is empty.
    `,
    invalidJson: (options: Options) => `${schemaHeader}
      The file ${options.generatorSchemaFilePath} is not a valid JSON.
      Please check the file content and try again.
    `,
  },
  layoutClassNamesConfig: {
    notFoundOrEmpty: (options: Options) => `${layoutClassNamesConfigHeader}
      The file ${options.layoutClassNamesConfigFilePath} does not exist or is empty.
    `,
  },
  classNamesMap: {
    notFoundOrEmpty: (options: Options) => `${classNamesMapHeader}
      The file ${options.classNameMapFilePath} does not exist or is empty.
    `,
  },
  themeConfig: {
    notFoundOrEmptyCocokits: (options: Options) => `${themeConfigHeader}
      The file ${options.cocokitsThemeConfigFilePath} does not exist or is empty.
    `,
    notFoundOrEmptyFramesX: (options: Options) => `${themeConfigHeader}
      The file ${options.framesXThemeConfigFilePath} does not exist or is empty.
    `,
  },
  allStyles: {
    notFoundOrEmptyCocokits: (options: Options) => `${allStylesHeader}
      The file ${options.cocokitsAllStylesFilePath} does not exist or is empty.
    `,
    notFoundOrEmptyFramesX: (options: Options) => `${allStylesHeader}
      The file ${options.framesXAllStylesFilePath} does not exist or is empty.
    `,
  },
  indexStyles: {
    notFoundOrEmptyCocokits: (options: Options) => `${indexStylesHeader}
      The file ${options.cocokitsIndexStylesFilePath} does not exist or is empty.
    `,
    notFoundOrEmptyFramesX: (options: Options) => `${indexStylesHeader}
      The file ${options.framesXIndexStylesFilePath} does not exist or is empty.
    `,
  },
  generateLibrary: {
    notFoundOrEmptyAngular: (options: Options) => `${generateLibraryHeader}
      The file ${options.angularComponentPackageJsonPath} does not exist or is empty.
    `,
    notFoundOrEmptyReact: (options: Options) => `${generateLibraryHeader}
    The file ${options.reactComponentPackageJsonPath} does not exist or is empty.
    `,
    invalidAngularPackageJson: (options: Options) => `${generateLibraryHeader}
      The file ${options.angularComponentPackageJsonPath} is not a valid JSON.
      Please check the file content and try again.
    `,
    invalidReactPackageJson: (options: Options) => `${generateLibraryHeader}
      The file ${options.reactComponentPackageJsonPath} is not a valid JSON.
      Please check the file content and try again.
    `,
  },
  docAdvancedConfig: {
    notFoundOrEmptyAngular: (options: Options) => `${docAdvancedConfigHeader}
      The file ${options.angularDocAdvanceConfigurationFilePath} does not exist or is empty.
    `,
    notFoundOrEmptyReact: (options: Options) => `${generateLibraryHeader}
    The file ${options.reactDocAdvanceConfigurationFilePath} does not exist or is empty.
    `,
  },
};
