import fs from 'fs';
import { join } from 'path';

import { TOKEN_DICTIONARY_FILE_NAME } from './builder.config';
import { getTokenDictionaryFileHeader } from './utils';
import { TokenGeneratorExecutorSchema } from '../schema';

import { TokenDictionary } from '@cocokits/core';

export function buildTokenDictionary(tokenDictionary: TokenDictionary, options: TokenGeneratorExecutorSchema) {
  const path = join(options.outputDir, TOKEN_DICTIONARY_FILE_NAME);
  const content = getTokenDictionaryFileHeader() + JSON.stringify(tokenDictionary, null, 2) + ';\n';
  fs.writeFileSync(path, content);
}
