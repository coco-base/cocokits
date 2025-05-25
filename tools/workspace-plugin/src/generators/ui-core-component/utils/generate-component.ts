import { errorMessages } from './errors';
import componentGenerator from '../../component/generator';
import { GeneratorDirectoryFormat, LibraryFramework } from '../../generator.model';
import libraryGenerator from '../../library/generator';
import { LibraryType } from '../../library/model';
import { UiCoreComponentGeneratorOptions } from '../model';

export async function generateComponent(options: UiCoreComponentGeneratorOptions) {
  // Angular
  await componentGenerator(options.tree, {
    name: options.componentName.fileName,
    project: options.angularLibrary.name,
    story: false,
    export: true,
    directory: 'src/lib',
    directoryFormat: GeneratorDirectoryFormat.AsProvided,
    formatFiles: false,
  });

  const updatedAngularPackageJsonString = getAngularNewPackageJson(options);
  options.tree.write(options.angularComponentPackageJsonPath, updatedAngularPackageJsonString);

  const updatedAngularDocAdvancedConfig = getAngularDocAdvancedConfig(options);
  options.tree.write(options.angularDocAdvanceConfigurationFilePath, updatedAngularDocAdvancedConfig);

  // React
  await libraryGenerator(options.tree, {
    name: options.libraryName.fileName,
    type: LibraryType.UI,
    framework: LibraryFramework.Angular,
    storybook: false,
    directory: `/packages/angular`,
    directoryFormat: GeneratorDirectoryFormat.AsProvided,
    publishable: true,
    importPath: `@cocokits/angular-${options.libraryName.fileName}`,
    formatFiles: false,
  });

  const updatedReactPackageJsonString = getReactNewPackageJson(options);
  options.tree.write(options.reactComponentPackageJsonPath, updatedReactPackageJsonString);

  const updatedReactDocAdvancedConfig = getReactDocAdvancedConfig(options);
  options.tree.write(options.reactDocAdvanceConfigurationFilePath, updatedReactDocAdvancedConfig);
}

function getAngularNewPackageJson(options: UiCoreComponentGeneratorOptions): string {
  const packageJsonString = options.tree.read(options.angularComponentPackageJsonPath, 'utf-8');

  if (!packageJsonString) {
    throw new Error(errorMessages.generateLibrary.notFoundOrEmptyAngular(options));
  }

  try {
    const packageJsonData = JSON.parse(packageJsonString);
    packageJsonData.dependencies = {
      ...packageJsonData.dependencies,
      [`@cocokits/angular-${options.libraryName.fileName}`]: 'workspace:*',
    };
    return JSON.stringify(packageJsonData, null, 2);
  } catch {
    throw new Error(errorMessages.generateLibrary.invalidAngularPackageJson(options));
  }
}

function getReactNewPackageJson(options: UiCoreComponentGeneratorOptions): string {
  const packageJsonString = options.tree.read(options.reactComponentPackageJsonPath, 'utf-8');

  if (!packageJsonString) {
    throw new Error(errorMessages.generateLibrary.notFoundOrEmptyReact(options));
  }

  try {
    const packageJsonData = JSON.parse(packageJsonString);
    packageJsonData.dependencies = {
      ...packageJsonData.dependencies,
      [`@cocokits/react-${options.libraryName.fileName}`]: 'workspace:*',
    };
    return JSON.stringify(packageJsonData, null, 2);
  } catch {
    throw new Error(errorMessages.generateLibrary.invalidReactPackageJson(options));
  }
}

function getAngularDocAdvancedConfig(options: UiCoreComponentGeneratorOptions): string {
  const docAdvancedConfig = options.tree.read(options.angularDocAdvanceConfigurationFilePath, 'utf-8');

  if (!docAdvancedConfig) {
    throw new Error(errorMessages.docAdvancedConfig.notFoundOrEmptyAngular(options));
  }

  return docAdvancedConfig.replace(
    /((getMergeThemesStep3Scss\s*\(\)\s*{[\s\S]*?code\(`scss[\s\S]*))(@include\s+[^\n;]+;)([\s\S]*?`)\)/m,
    `$1$3\n@include Cocokits.components_${options.componentName.fileName};;$4)`
  );
}

function getReactDocAdvancedConfig(options: UiCoreComponentGeneratorOptions): string {
  const docAdvancedConfig = options.tree.read(options.reactDocAdvanceConfigurationFilePath, 'utf-8');

  if (!docAdvancedConfig) {
    throw new Error(errorMessages.docAdvancedConfig.notFoundOrEmptyReact(options));
  }

  return docAdvancedConfig.replace(
    /((getMergeThemesStep3Scss\s*\(\)\s*{[\s\S]*?code\(`scss[\s\S]*))(@include\s+[^\n;]+;)([\s\S]*?`)\)/m,
    `$1$3\n@include Cocokits.components_${options.componentName.fileName};;$4)`
  );
}
