import { errorMessages } from './errors';
import componentGenerator from '../../component/generator';
import { GeneratorDirectoryFormat } from '../../generator.model';
import { UiCoreComponentGeneratorOptions } from '../model';

export async function generateComponent(options: UiCoreComponentGeneratorOptions) {
  // Angular
  await componentGenerator(options.tree, {
    name: options.componentName.fileName,
    project: options.angularLibrary.name,
    story: false,
    export: true,
    directory: `src/lib`,
    directoryFormat: GeneratorDirectoryFormat.Root,
    formatFiles: false,
  });

  const updatedAngularPackageJsonString = getAngularNewPackageJson(options);
  options.tree.write(options.angularComponentPackageJsonPath, updatedAngularPackageJsonString);

  const updatedAngularDocAdvancedConfig = getAngularDocAdvancedConfig(options);
  options.tree.write(options.angularDocAdvanceConfigurationFilePath, updatedAngularDocAdvancedConfig);

  // React
  await componentGenerator(options.tree, {
    name: options.componentName.fileName,
    project: options.reactLibrary.name,
    story: false,
    export: true,
    directory: `src/lib`,
    directoryFormat: GeneratorDirectoryFormat.Root,
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
    /(@include Cocokits.components[\s\S]+?;)(?![\s\S]*@include Cocokits.components)/gm,
    `$1\n@include Cocokits.components_${options.componentName.underscoreFileName};`
  );
}

function getReactDocAdvancedConfig(options: UiCoreComponentGeneratorOptions): string {
  const docAdvancedConfig = options.tree.read(options.reactDocAdvanceConfigurationFilePath, 'utf-8');

  if (!docAdvancedConfig) {
    throw new Error(errorMessages.docAdvancedConfig.notFoundOrEmptyReact(options));
  }

  return docAdvancedConfig.replace(
    /(@include Cocokits.components[\s\S]+?;)(?![\s\S]*@include Cocokits.components)/gm,
    `$1\n@include Cocokits.components_${options.componentName.underscoreFileName};`
  );
}
