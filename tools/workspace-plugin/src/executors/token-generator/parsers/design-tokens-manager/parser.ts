import { fillAliasHierarchiesTokenDictionary } from './alias-hierarchies-token-dictionary';
import { getBaseTokenDictionary } from './base-token-dictionary';
import { readManifest, validateUniqGroupNameInCollections } from './util';
import { fillValueTokenDictionary } from './value-token-doctinary';
import { fillVariableTokenDictionary } from './variable-token-dictionary';
import { TokenGeneratorExecutorSchema } from '../../schema';

import { TokenDictionary } from '@cocokits/core';

export function parseDesignTokensManager(options: TokenGeneratorExecutorSchema): TokenDictionary {
  const manifest = readManifest(options);

  const tokenDictionary = getBaseTokenDictionary(manifest, options);
  validateUniqGroupNameInCollections(tokenDictionary);

  fillVariableTokenDictionary(tokenDictionary, options);
  fillAliasHierarchiesTokenDictionary(tokenDictionary);
  fillValueTokenDictionary(tokenDictionary);

  return tokenDictionary;
}
