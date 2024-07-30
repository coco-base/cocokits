import { recordForEach } from '@cocokits/common-utils';

import { AliasHierarchy, TokenDictionary, TokenId, TokenMap } from '../../token.model';

export function fillAliasHierarchyTokenDictionary(tokenDictionary: TokenDictionary) {
  recordForEach(tokenDictionary.tokenMap, (token) => {
    Object.values(token.modes).forEach((tokenValues) => {
      if (!tokenValues.aliasTokenId) {
        return;
      }

      const aliasHierarchy = getAliasHierarchies(tokenValues.aliasTokenId, tokenDictionary.tokenMap);
      tokenValues.aliasHierarchy = aliasHierarchy;
    });
  });
}

function getAliasHierarchies(aliasTokenId: TokenId, tokenMap: TokenMap): AliasHierarchy[][] {
  const aliasToken = tokenMap[aliasTokenId];

  if (!aliasToken) {
    throw new Error(`Can not find a token with following alias id: ${aliasTokenId}`);
  }

  return Object.entries(aliasToken.modes).reduce((prev, [modeName, tokenValues]) => {
    const currentHierarchy: AliasHierarchy = {
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
  }, [] as AliasHierarchy[][]);
}
