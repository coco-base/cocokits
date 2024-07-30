import { fillAliasHierarchyTokenDictionary } from './alias-hierarchy-token-dictionary';
import { getBaseTokenDictionary } from './base-token-dictionary';
import { readManifest, validateUniqGroupNameInCollections } from './util';
import { fillValueTokenDictionary } from './value-token-doctinary';
import { fillVariableTokenDictionary } from './variable-token-dictionary';
import { TokenGeneratorExecutorSchema } from '../../schema';
import { TokenDictionary } from '../../token.model';

export function parseDesignTokensManager(options: TokenGeneratorExecutorSchema): TokenDictionary {
  const manifest = readManifest(options);

  const tokenDictionary = getBaseTokenDictionary(manifest, options);
  validateUniqGroupNameInCollections(tokenDictionary);

  fillVariableTokenDictionary(tokenDictionary, options);
  fillAliasHierarchyTokenDictionary(tokenDictionary);
  fillValueTokenDictionary(tokenDictionary);

  return tokenDictionary;
}
