import { errorMessages } from './errors';
import { UiCoreComponentGeneratorOptions } from '../model';

export function updateLayoutClassNamesConfig(options: UiCoreComponentGeneratorOptions) {
  const fileContent = options.tree.read(options.layoutClassNamesConfigFilePath, 'utf-8');

  if (!fileContent) {
    throw new Error(errorMessages.layoutClassNamesConfig.notFoundOrEmpty(options));
  }

  // Import path
  fileContent.replace(
    /(import[\s\S]+?;)(?![\s\S]*import)/,
    `$1\nimport { ${options.componentName.propertyName}LayoutClassNamesConfig } from './${options.componentName.fileName}-class-names';`
  );

  // Update layoutClassNamesConfigRecord
  fileContent.replace(
    /(\s*)(};)/,
    `$1 ${options.componentName.propertyName}: ${options.componentName.propertyName}LayoutClassNamesConfig,\n$1$2`
  );
}
