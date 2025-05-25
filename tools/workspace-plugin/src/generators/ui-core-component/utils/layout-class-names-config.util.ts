import { errorMessages } from './errors';
import { UiCoreComponentGeneratorOptions } from '../model';

export function updateLayoutClassNamesConfig(options: UiCoreComponentGeneratorOptions) {
  let fileContent = options.tree.read(options.layoutClassNamesConfigFilePath, 'utf-8');

  if (!fileContent) {
    throw new Error(errorMessages.layoutClassNamesConfig.notFoundOrEmpty(options));
  }

  // Import path
  fileContent = fileContent.replace(
    /(import[\s\S]+?;)(?![\s\S]*import)/gm,
    `$1\nimport { ${options.componentName.propertyName}LayoutClassNamesConfig } from './${options.componentName.fileName}-class-names';`
  );

  // Update layoutClassNamesConfigRecord
  fileContent = fileContent.replace(
    /(\s*)(};)/gm,
    `$1 ${options.componentName.propertyName}: ${options.componentName.propertyName}LayoutClassNamesConfig,\n$1$2`
  );

  options.tree.write(options.layoutClassNamesConfigFilePath, fileContent);
}
