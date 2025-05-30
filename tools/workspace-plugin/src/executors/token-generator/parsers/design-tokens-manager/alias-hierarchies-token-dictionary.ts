import { recordForEach } from '@cocokits/common-utils';
import { TokenAliasHierarchy, TokenDictionary, TokenId, TokenMap } from '@cocokits/core';

export function fillAliasHierarchiesTokenDictionary(tokenDictionary: TokenDictionary) {
  recordForEach(tokenDictionary.tokenMap, (token) => {
    Object.values(token.modes).forEach((tokenValues) => {
      if (!tokenValues.aliasTokenId) {
        return;
      }

      const aliasHierarchies = getAliasHierarchies(tokenValues.aliasTokenId, tokenDictionary.tokenMap);
      tokenValues.aliasHierarchies = aliasHierarchies;
    });
  });
}

function getAliasHierarchies(aliasTokenId: TokenId, tokenMap: TokenMap): TokenAliasHierarchy[][] {
  const aliasToken = tokenMap[aliasTokenId];

  if (!aliasToken) {
    throw new Error(`Can not find a token with following alias id: ${aliasTokenId}`);
  }

  return Object.entries(aliasToken.modes).reduce((prev, [modeName, tokenValues]) => {
    const currentHierarchy: TokenAliasHierarchy = {
      tokenId: aliasToken.id,
      collectionName: aliasToken.collectionName,
      modeName,
      namePath: aliasToken.namePath,
      type: aliasToken.type,
    };

    if (tokenValues.aliasTokenId === null) {
      return [...prev, [currentHierarchy]];
    }

    const aliasTokenHierarchies = getAliasHierarchies(tokenValues.aliasTokenId, tokenMap);
    const aliasTokenHierarchyWithCurrentToken = aliasTokenHierarchies.map((aliasTokenHierarchy) => [
      currentHierarchy,
      ...aliasTokenHierarchy,
    ]);

    return [...prev, ...aliasTokenHierarchyWithCurrentToken];
  }, [] as TokenAliasHierarchy[][]);
}
