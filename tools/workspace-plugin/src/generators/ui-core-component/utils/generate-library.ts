import { errorMessages } from './errors';
import { GeneratorDirectoryFormat, LibraryFramework } from '../../generator.model';
import libraryGenerator from '../../library/generator';
import { LibraryType } from '../../library/model';
import { UiCoreComponentGeneratorOptions } from '../model';

export async function generateLibrary(options: UiCoreComponentGeneratorOptions) {
  // Angular
  await libraryGenerator(options.tree, {
    name: options.libraryName.fileName,
    type: LibraryType.UI,
    framework: LibraryFramework.Angular,
    storybook: false,
    directory: `/packages/angular`,
    directoryFormat: GeneratorDirectoryFormat.Root,
    publishable: true,
    importPath: `@cocokits/angular-${options.libraryName.fileName}`,
    formatFiles: false,
  });

  const updatedAngularPackageJsonString = getAngularNewPackageJson(options);
  options.tree.write(options.angularComponentPackageJsonPath, updatedAngularPackageJsonString);

  // React
  await libraryGenerator(options.tree, {
    name: options.libraryName.fileName,
    type: LibraryType.UI,
    framework: LibraryFramework.React,
    storybook: false,
    directory: `/packages/react`,
    directoryFormat: GeneratorDirectoryFormat.Root,
    publishable: true,
    importPath: `@cocokits/react-${options.libraryName.fileName}`,
    formatFiles: false,
  });

  const updatedReactPackageJsonString = getReactNewPackageJson(options);
  options.tree.write(options.reactComponentPackageJsonPath, updatedReactPackageJsonString);
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
