import fs from 'fs';
import path from 'path';

import { recordForEach, recordReduceMerge, reduceMerge } from '@cocokits/common-utils';
import { TokenCollectionName, TokenDictionary } from '@cocokits/core';

import { SCSS_FOLDER_NAME } from './builder.config';
import { getDefaultFileHeader, getImportFileName, getScssFileName } from './utils';
import { TokenGeneratorExecutorSchema } from '../schema';
import { Logger } from '../../../utils/logger';

/**
 * Builds CSS variables from the compiler result and save them.
 */
export function buildScss(tokenDictionary: TokenDictionary, options: TokenGeneratorExecutorSchema) {
  const scssDir = path.join(options.outputDir, SCSS_FOLDER_NAME);

  // Generate header and @mixin for each modes
  const fileContent = recordReduceMerge(
    tokenDictionary.collectionModeNames,
    (modeNames, collectionName: TokenCollectionName) => {
      return reduceMerge(modeNames, () => {
        return {
          [getScssFileName(collectionName)]: getDefaultFileHeader(),
        };
      });
    }
  );

  // Fill the token variables
  recordForEach(tokenDictionary.tokenMap, (token) => {
    const fileName = getScssFileName(token.collectionName);
    fileContent[fileName] += `${token.variable.scss}: ${token.variable.css};\n`;
  });

  // Save files
  recordForEach(fileContent, (content, fileName) => {
    const filePath = path.join(scssDir, fileName);
    fs.mkdirSync(scssDir, { recursive: true });
    fs.writeFileSync(filePath, content);
    Logger.success(`✔ [CREATED]: ${filePath}`);
  });

  // Build index file
  let indexFileContent = getDefaultFileHeader();
  recordForEach(fileContent, (_, fileName) => {
    indexFileContent += `@forward './${getImportFileName(fileName)}';\n`;
  });
  const filePath = path.join(scssDir, '_index.scss');
  fs.writeFileSync(filePath, indexFileContent);

  Logger.success(`✔ [CREATED]: ${filePath}`);
}
