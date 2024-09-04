import { execSync } from 'child_process';
import fs from 'fs';

import { buildCss } from './build-css';
import { buildMixins } from './build-mixins';
import { buildScss } from './build-scss';
import { buildTokenDictionary } from './build-token-dictionary';
import { TokenGeneratorExecutorSchema } from '../schema';

import { TokenDictionary } from '@cocokits/core';

export function builder(tokenDictionary: TokenDictionary, options: TokenGeneratorExecutorSchema) {
  execSync(`rm -rf ${options.outputDir}`);
  fs.mkdirSync(options.outputDir, { recursive: true });

  buildTokenDictionary(tokenDictionary, options);
  buildMixins(tokenDictionary, options);
  buildCss(tokenDictionary, options);
  buildScss(tokenDictionary, options);
}
