import { execSync } from 'child_process';
import fs from 'fs';

import { TokenDictionary } from '@cocokits/core';

import { buildCore } from './build-core';
import { buildCss } from './build-css';
import { buildScss } from './build-scss';
import { buildTokenDictionary } from './build-token-dictionary';
import { TokenGeneratorExecutorSchema } from '../schema';

export async function builder(tokenDictionary: TokenDictionary, options: TokenGeneratorExecutorSchema) {
  execSync(`npx rimraf ${options.outputDir}`);
  fs.mkdirSync(options.outputDir, { recursive: true });

  buildTokenDictionary(tokenDictionary, options);
  buildCore(tokenDictionary, options);
  await buildCss(options);
  buildScss(tokenDictionary, options);
}
