import fs from 'fs';
import path from 'path';

import {
  clearDir,
  CSS_VARIABLES_FOLDER_NAME,
  MIXINS_FOLDER_NAME,
  sanitizeCSSSelectorName,
  sanitizeMixinName,
} from './builder.util';
import { logEndParsing, logFileHasGenerated, logStartParsing } from './logger';
import { ScssifyTokenExecutorSchema } from '../schema';
import { CollectionWithModeName, CompilerResult } from '../token.model';
import { recordForEach } from '../utils/record-for-each';

/**
 * Builds CSS variables from the compiler result and save them.
 *
 * @param compilerResult The result from the CSS compiler.
 */
export function buildCssVariables(compilerResult: CompilerResult, options: ScssifyTokenExecutorSchema) {
  logStartParsing('CSS-Variables');

  const cssVariablesDir = path.join(options.outputDir, CSS_VARIABLES_FOLDER_NAME);

  clearDir(cssVariablesDir);

  recordForEach(compilerResult.transformedTokens, (tokens, collectionWithModeName) => {
    const content = getFileContent(collectionWithModeName, options.themeName);
    const mixinFilePath = writeContentToFile(content, collectionWithModeName, cssVariablesDir);
    logFileHasGenerated(mixinFilePath);
  });

  logEndParsing('CSS-Variables');
}

function getFileContent(collectionWithModeName: CollectionWithModeName, themeName: string) {
  const mixinName = sanitizeMixinName(collectionWithModeName);
  const cssSelectorName = sanitizeCSSSelectorName(collectionWithModeName);

  const content = `
/**
 * Do not edit directly
 * Generated by coco-kits scssify-token executor on ${new Date()}
 */

@use '../${MIXINS_FOLDER_NAME}/${collectionWithModeName}.mixin' as *;

:where(.cck-theme-${themeName}__${cssSelectorName}),
:where([data-cck-theme*='${themeName}__${cssSelectorName}']) {
  @include ${mixinName};
}
`;

  return content;
}

function writeContentToFile(content: string, collectionWithModeName: CollectionWithModeName, cssVariablesDir: string) {
  const filePath = path.join(cssVariablesDir, `${collectionWithModeName}.scss`);
  fs.mkdirSync(cssVariablesDir, { recursive: true });
  fs.writeFileSync(filePath, content);

  return filePath;
}
