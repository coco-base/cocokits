import { logEndParsing, logFileHasGenerated, logStartParsing } from './logger';
import { ScssifyTokenExecutorSchema } from '../schema';
import { CompilerResult, TransformedDesignToken, TransformedDesignTokenCollectionMap } from '../token.model';
import path from 'path';
import {
  clearDir,
  MIXINS_FOLDER_NAME,
  sanitizeCSSVariableName,
  sanitizeMixinName,
  sanitizeValue,
} from './builder.util';
import { recordForEach } from '../utils/record-for-each';
import fs from 'fs';

/**
 * Builds variables mixins from the compiler result and save them.
 *
 * @param compilerResult The result from the CSS compiler.
 */
export function buildScssMixins(compilerResult: CompilerResult, options: ScssifyTokenExecutorSchema) {
  logStartParsing('mixins');

  const mixinDir = path.join(options.outputDir, MIXINS_FOLDER_NAME);
  clearDir(mixinDir);

  recordForEach(compilerResult.transformedTokens, (tokens, collectionName) => {
    const content = getFileContent(tokens, collectionName);
    const mixinFilePath = writeContentToFile(content, collectionName, mixinDir);
    logFileHasGenerated(mixinFilePath);
  });

  const indexFilePath = generateIndexFile(compilerResult.transformedTokens, mixinDir);
  logFileHasGenerated(indexFilePath);

  logEndParsing('Mixins');
}

function generateIndexFile(transformedTokens: TransformedDesignTokenCollectionMap, mixinDir: string) {
  let content = '';
  recordForEach(transformedTokens, (_, collectionName) => {
    content += `@import './${collectionName}.mixin';`;
  });

  const indexFilePath = path.join(mixinDir, `index.scss`);
  fs.writeFileSync(indexFilePath, content);

  return indexFilePath;
}

function writeContentToFile(content: string, collectionName: string, mixinDir: string) {
  const filePath = path.join(mixinDir, `_${collectionName}.mixin.scss`);
  fs.mkdirSync(mixinDir, { recursive: true });
  fs.writeFileSync(filePath, content);

  return filePath;
}

function getFileContent(tokens: TransformedDesignToken[], collectionName: string) {
  const variables = tokens.reduce((previousValue, token) => {
    const variableName = sanitizeCSSVariableName(token.namePath);
    const value = sanitizeValue(token.value, token.isAlias);
    return `${previousValue}\n--${variableName}: ${value};`;
  }, '');

  const content = `
/**
 * Do not edit directly
 * Generated by coco-kits scssify-token executor on ${new Date()}
 */

@mixin ${sanitizeMixinName(collectionName)} {
${variables.trim()}
}
`;

  return content;
}