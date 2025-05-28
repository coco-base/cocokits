import { errorMessages } from './errors';
import { UiCoreComponentGeneratorOptions } from '../model';

export function updateClassNamesMap(options: UiCoreComponentGeneratorOptions) {
  let fileContent = options.tree.read(options.classNameMapFilePath, 'utf-8');

  if (!fileContent) {
    throw new Error(errorMessages.classNamesMap.notFoundOrEmpty(options));
  }

  // Import path
  fileContent = fileContent.replace(
    /(import[\s\S]+?;)(?![\s\S]*import)/gm,
    `$1\nimport { get${options.componentName.className}ClassNames } from './${options.componentName.fileName}-class-names';`
  );

  // Update CLASS_NAMES_FN_MAP
  fileContent = fileContent.replace(
    /(CLASS_NAMES_FN_MAP\s*=\s*{[\s\S]*?)(\s*};)/gm,
    `$1\n${options.componentName.propertyName}: get${options.componentName.className}ClassNames,$2`
  );

  options.tree.write(options.classNameMapFilePath, fileContent);
}
