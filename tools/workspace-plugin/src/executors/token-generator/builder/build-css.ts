import fs from 'fs';
import path from 'path';

import { recordForEach, recordReduceMerge, reduceMerge } from '@cocokits/common-utils';

import { CSS_FOLDER_NAME } from './builder.config';
import { getCssFileHeader, getCssFileName, getIndexFileHeader, getMixinName } from './utils';
import { TokenGeneratorExecutorSchema } from '../schema';
import { TokenCollectionName, TokenDictionary } from '../token.model';

/**
 * Builds CSS variables from the compiler result and save them.
 */
export function buildCss(tokenDictionary: TokenDictionary, options: TokenGeneratorExecutorSchema) {
  const cssDir = path.join(options.outputDir, CSS_FOLDER_NAME);

  // Generate header and @mixin for each modes
  const fileContent = recordReduceMerge(
    tokenDictionary.collectionModeNames,
    (modeNames, collectionName: TokenCollectionName) => {
      return reduceMerge(modeNames, (modeName) => {
        const content = `${getCssFileHeader(collectionName, modeName.name)}
      :where(.cck-theme-${options.themeName}__${collectionName}--${modeName.name}),
      :where([data-cck-theme*='${options.themeName}__${collectionName}--${modeName.name}']) {
        @include ${getMixinName(collectionName, modeName.name)};
       }`;
        return {
          [getCssFileName(collectionName, modeName.name)]: content,
        };
      });
    }
  );

  // Save files
  recordForEach(fileContent, (content, fileName) => {
    const filePath = path.join(cssDir, fileName);
    fs.mkdirSync(cssDir, { recursive: true });
    fs.writeFileSync(filePath, content);
  });

  // Build index file
  let indexFileContent = getIndexFileHeader();
  recordForEach(fileContent, (_, fileName) => {
    indexFileContent += `@import './${fileName.replace('.scss', '')}';\n`;
  });
  const indexFilePath = path.join(cssDir, 'index.scss');
  fs.writeFileSync(indexFilePath, indexFileContent);
}
