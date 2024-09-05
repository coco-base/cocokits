import fs from 'fs';
import path from 'path';

import { recordForEach, recordReduceMerge, reduceMerge } from '@cocokits/common-utils';
import { TokenCollectionName, TokenDictionary } from '@cocokits/core';

import { MIXIN_FOLDER_NAME } from './builder.config';
import { getIndexFileHeader, getMixinFileHeader, getMixinFileName } from './utils';
import { TokenGeneratorExecutorSchema } from '../schema';

/**
 * Builds CSS variables from the compiler result and save them.
 */
export function buildMixins(tokenDictionary: TokenDictionary, options: TokenGeneratorExecutorSchema) {
  const mixinsDir = path.join(options.outputDir, MIXIN_FOLDER_NAME);

  // Generate header and @mixin for each modes
  const fileContent = recordReduceMerge(
    tokenDictionary.collectionModeNames,
    (modeNames, collectionName: TokenCollectionName) => {
      return reduceMerge(modeNames, (modeName) => {
        return {
          [getMixinFileName(collectionName, modeName.name)]: getMixinFileHeader(collectionName, modeName.name),
        };
      });
    }
  );

  // Fill the token variables
  recordForEach(tokenDictionary.tokenMap, (token) => {
    recordForEach(token.modes, (tokenValue, modeName) => {
      const fileName = getMixinFileName(token.collectionName, modeName);
      fileContent[fileName] += `--${token.variable.name}: ${tokenValue.value};\n`;
    });
  });

  // Generate footer
  recordForEach(fileContent, (content, fileName) => {
    fileContent[fileName] = content + `}\n`;
  });

  // Save files
  recordForEach(fileContent, (content, fileName) => {
    const filePath = path.join(mixinsDir, fileName);
    fs.mkdirSync(mixinsDir, { recursive: true });
    fs.writeFileSync(filePath, content);
  });

  // Build index file
  let indexFileContent = getIndexFileHeader();
  recordForEach(fileContent, (_, fileName) => {
    indexFileContent += `@import './${fileName.replace('.scss', '')}';\n`;
  });
  const filePath = path.join(mixinsDir, 'index.scss');
  fs.writeFileSync(filePath, indexFileContent);
}
