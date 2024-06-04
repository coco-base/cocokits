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
import { CompilerResult } from '../token.model';
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

  recordForEach(compilerResult.transformedTokens, (tokens, collectionName) => {
    const content = getFileContent(collectionName, options.themeName);
    const mixinFilePath = writeContentToFile(content, collectionName, cssVariablesDir);
    logFileHasGenerated(mixinFilePath);
  });

  logEndParsing('CSS-Variables');
}

function getFileContent(collectionName: string, themeName: string) {
  const mixinName = sanitizeMixinName(collectionName);
  const cssSelectorName = sanitizeCSSSelectorName(collectionName);

  const content = `
/**
 * Do not edit directly
 * Generated by coco-kits scssify-token executor on ${new Date()}
 */

@use '../${MIXINS_FOLDER_NAME}/${collectionName}.mixin' as *;

:where(.theme-${themeName}__${cssSelectorName}),
:where([data-theme-${themeName}__${cssSelectorName}]) {
  @include ${mixinName};
}
`;

  return content;
}

function writeContentToFile(content: string, collectionName: string, cssVariablesDir: string) {
  const filePath = path.join(cssVariablesDir, `${collectionName}.scss`);
  fs.mkdirSync(cssVariablesDir, { recursive: true });
  fs.writeFileSync(filePath, content);

  return filePath;
}
