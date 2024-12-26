import { Token, TokenMap } from '@cocokits/core';

export function getTokenDictionaryValueHierarchy(token: Token, tokenMap: TokenMap) {
  return Object.entries(token.modes).flatMap(([modeName, tokenValue]) => {
    if (tokenValue.aliasHierarchies) {
      return tokenValue.aliasHierarchies.map((aliasHierarchies) => {
        const lastAliasHierarchyToken = aliasHierarchies[aliasHierarchies.length - 1];
        const lastAliasToken = tokenMap[lastAliasHierarchyToken.tokenId];
        return [
          {
            tokenId: token.id,
            type: token.type,
            modeName,
            text: token.namePath.join(' / '),
          },
          ...aliasHierarchies.map((aliasHierarchy) => ({
            tokenId: aliasHierarchy.tokenId,
            type: aliasHierarchy.type,
            collectionName: aliasHierarchy.collectionName,
            modeName: aliasHierarchy.modeName,
            text: aliasHierarchy.namePath.join(' / '),
          })),
          {
            tokenId: lastAliasHierarchyToken.tokenId,
            type: lastAliasHierarchyToken.type,
            text: lastAliasToken.modes[lastAliasHierarchyToken.modeName].value,
          },
        ];
      });
    }

    return [
      [
        {
          tokenId: token.id,
          type: token.type,
          modeName,
          text: token.namePath.join(' / '),
        },
        {
          tokenId: token.id,
          type: token.type,
          text: tokenValue.value,
        },
      ],
    ];
  });
}
