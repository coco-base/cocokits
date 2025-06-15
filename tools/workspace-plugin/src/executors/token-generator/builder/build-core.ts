import fs from 'fs';
import path from 'path';

import { recordForEach, recordReduceMerge, reduceMerge } from '@cocokits/common-utils';
import { TokenCollectionModeNames, TokenCollectionName, TokenDictionary } from '@cocokits/core';

import { CORE_FOLDER_NAME } from './builder.config';
import { getCoreFileName, getDefaultFileHeader, getImportFileName, getMixinBaseName } from './utils';
import { Logger } from '../../../utils/logger';
import { TokenGeneratorExecutorSchema } from '../schema';

/**
 * Builds Core (CSS variables) from the compiler result and save them.
 */
export function buildCore(tokenDictionary: TokenDictionary, options: TokenGeneratorExecutorSchema) {
  const coreDir = path.join(options.outputDir, CORE_FOLDER_NAME);

  const generatedFileNames = buildCoreFiles(tokenDictionary, coreDir, options.themeName);
  buildUseAllFile(generatedFileNames, tokenDictionary.collectionModeNames, coreDir);
  buildIndexFile(generatedFileNames, coreDir);
}

// Generate header and @mixin for each modes
function buildCoreFiles(tokenDictionary: TokenDictionary, coreDir: string, themeName: string) {
  // Step1: Generate map. key is file name and the value at this step is:
  // - header
  // - @mixin use_... (with full content)
  // - @mixin variables_... (just mixin definition without content)
  const fileNameContentMap = recordReduceMerge(
    tokenDictionary.collectionModeNames,
    (modeNames, collectionName: TokenCollectionName) => {
      return reduceMerge(modeNames, (modeName) => {
        const mixinBaseName = getMixinBaseName(collectionName, modeName.name);
        const header = getDefaultFileHeader();

        const useMixin = `
          @mixin use_${mixinBaseName} {
            :where(.cck-theme-${themeName}__${collectionName}--${modeName.name}),
            :where([data-cck-theme*='${themeName}__${collectionName}--${modeName.name}']) {
              @include variables_${mixinBaseName};
            }
          }
          
        `;

        const variablesMixin = `@mixin variables_${getMixinBaseName(collectionName, modeName.name)} {\n`;

        return {
          [getCoreFileName(collectionName, modeName.name)]: header + useMixin + variablesMixin,
        };
      });
    }
  );

  // Step 2: Fill the token variables in @mixin variables_...
  recordForEach(tokenDictionary.tokenMap, (token) => {
    recordForEach(token.modes, (tokenValue, modeName) => {
      const fileName = getCoreFileName(token.collectionName, modeName);
      fileNameContentMap[fileName] += `--${token.variable.name}: ${tokenValue.value};\n`;
    });
  });

  // Step 3: Generate footer (close the @mixin variables_...)
  recordForEach(fileNameContentMap, (content, fileName) => {
    fileNameContentMap[fileName] = content + `}\n`;
  });

  // Step 4: Save files
  recordForEach(fileNameContentMap, (content, fileName) => {
    const filePath = path.join(coreDir, fileName);
    fs.mkdirSync(coreDir, { recursive: true });
    fs.writeFileSync(filePath, content);
    Logger.success(`✔ [CREATED]: ${filePath}`);
  });

  return Object.keys(fileNameContentMap);
}

function buildUseAllFile(generatedFileNames: string[], collectionModeNames: TokenCollectionModeNames, coreDir: string) {
  // Imports
  let useAllFileContent = getDefaultFileHeader();
  generatedFileNames.forEach((fileName) => {
    const usePath = getImportFileName(fileName);
    useAllFileContent += `@use './${usePath}' as *;\n`;
  });

  // use_all
  let useAllMixinContent = '@mixin use_all {';
  const useAllMixinIncludeContent = Object.entries(collectionModeNames).reduce(
    (result, [collectionName, modeNames]) => {
      const modesIncludes = modeNames.map(
        (modeName) => `@include use_${getMixinBaseName(collectionName, modeName.name)};`
      );
      return result + '\n' + modesIncludes.join('\n');
    },
    ''
  );

  useAllMixinContent += useAllMixinIncludeContent;
  useAllMixinContent += '\n}';

  // Save file
  const useAllFilePath = path.join(coreDir, '_use-all.scss');
  fs.writeFileSync(useAllFilePath, useAllFileContent + '\n\n' + useAllMixinContent);
  Logger.success(`✔ [CREATED]: ${useAllFilePath}`);
}

function buildIndexFile(generatedFileNames: string[], coreDir: string) {
  let indexFileContent = getDefaultFileHeader();
  indexFileContent += "@forward './use-all';\n";

  generatedFileNames.forEach((fileName) => {
    indexFileContent += `@forward './${getImportFileName(fileName)}';\n`;
  });

  const indexFilePath = path.join(coreDir, '_index.scss');

  fs.writeFileSync(indexFilePath, indexFileContent);
  Logger.success(`✔ [CREATED]: ${indexFilePath}`);
}
