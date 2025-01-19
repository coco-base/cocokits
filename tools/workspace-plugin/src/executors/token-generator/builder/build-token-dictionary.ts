import * as fs from 'fs';
import { join } from 'path';

import { TokenDictionary } from '@cocokits/core';

import { TOKEN_DICTIONARY_FOLDER_NAME } from './builder.config';
import { getTokenDictionaryFileHeader } from './utils';
import { Logger } from '../../../utils/logger';
import { TokenGeneratorExecutorSchema } from '../schema';

export function buildTokenDictionary(tokenDictionary: TokenDictionary, options: TokenGeneratorExecutorSchema) {
  const dictionaryDir = join(options.outputDir, TOKEN_DICTIONARY_FOLDER_NAME);
  fs.mkdirSync(dictionaryDir, { recursive: true });

  const path = join(dictionaryDir, 'token-dictionary.ts');
  const content = getTokenDictionaryFileHeader() + JSON.stringify(tokenDictionary, null, 2) + ';\n';
  fs.writeFileSync(path, content);
  Logger.success(`✔ [CREATED]: ${path}`);
}
