import { ParserResult } from '../token.model';
import { ScssifyTokenExecutorSchema } from '../schema';
import path from 'path';
import fs from 'fs';
import { COLLECTION_MAP_WITH_MODE_FILENAME } from './builder.util';
import { logEndParsing, logFileHasGenerated, logStartParsing } from './logger';

export function buildCollectionsMap(parserResult: ParserResult, options: ScssifyTokenExecutorSchema) {
  logStartParsing('Collections Map With Mode Names');

  const content = getFileContent(parserResult);
  const filePath = writeContentToFile(content, options);

  logFileHasGenerated(filePath);

  logEndParsing('Collections Map With Mode Names');
}

function getFileContent(parserResult: ParserResult) {
  return `export const collections = ${JSON.stringify(parserResult.collectionsMapWithMode, null, 2)};`;
}

function writeContentToFile(content: string, options: ScssifyTokenExecutorSchema) {
  const filePath = path.join(options.outputDir, `${COLLECTION_MAP_WITH_MODE_FILENAME}`);
  fs.writeFileSync(filePath, content);

  return filePath;
}
