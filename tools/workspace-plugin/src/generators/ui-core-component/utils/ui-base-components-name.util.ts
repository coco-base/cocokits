import { errorMessages } from './errors';
import { UiCoreComponentGeneratorOptions } from '../model';

export function updateUiBaseComponentsNameFile(options: UiCoreComponentGeneratorOptions) {
  let content = options.tree.read(options.uiBaseComponentsNameFilePath, 'utf-8');

  if (!content) {
    throw new Error(errorMessages.uiBaseComponentsName.notFoundOrEmpty(options));
  }

  const newContent = options.newLibrary
    ? getNewLibraryContent(content, options)
    : getExitingLibraryContent(content, options);

  if (options.newLibrary) {
    content = content.replace(
      /(UIBaseComponentsName[\s\S]*?)(;)/,
      `$1 | ${options.libraryName.className}ComponentName$2`
    );
  }

  options.tree.write(options.uiBaseComponentsNameFilePath, newContent);
}

function getExitingLibraryContent(originalFileContent: string, options: UiCoreComponentGeneratorOptions) {
  const keywordToSearch = `type ${options.libraryName.className}ComponentName = `.replaceAll(' ', '\\s*');
  const regex = new RegExp(`^(${keywordToSearch}[^;]*);`, 'gm');

  if (!regex.test(originalFileContent)) {
    throw new Error(errorMessages.uiBaseComponentsName.noLibraryFounded(options));
  }

  return originalFileContent.replace(
    new RegExp(`^(${keywordToSearch}[^;]*);`, 'gm'),
    `$1 | '${options.componentName.propertyName}';`
  );
}

function getNewLibraryContent(originalFileContent: string, options: UiCoreComponentGeneratorOptions) {
  if (originalFileContent.includes(`${options.libraryName.className}ComponentName`)) {
    throw new Error(errorMessages.uiBaseComponentsName.libraryExist(options));
  }

  return (
    originalFileContent +
    `\ntype ${options.libraryName.className}ComponentName = '${options.componentName.propertyName}';\n`
  );
}
