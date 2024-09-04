import fs from 'fs';
import path from 'path';

import { recordForEach, recordReduceMerge, reduceMerge } from '@cocokits/common-utils';

import { SCSS_FOLDER_NAME } from './builder.config';
import { getIndexFileHeader, getScssFileHeader, getScssFileName } from './utils';
import { TokenGeneratorExecutorSchema } from '../schema';
import { TokenCollectionName, TokenDictionary } from '@cocokits/core';

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
          [getScssFileName(collectionName)]: getScssFileHeader(),
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
  });

  // Build index file
  let indexFileContent = getIndexFileHeader();
  recordForEach(fileContent, (_, fileName) => {
    indexFileContent += `@import './${fileName.replace('.scss', '')}';\n`;
  });
  const filePath = path.join(scssDir, 'index.scss');
  fs.writeFileSync(filePath, indexFileContent);
}
