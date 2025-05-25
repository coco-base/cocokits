import { recordForEach } from '@cocokits/common-utils';
import { Token, TokenDictionary, TokenGroupOrTokenIds, TokenId } from '@cocokits/core';

export function getTokenList(groupOrTokenIds: TokenGroupOrTokenIds, tokenDictionary: TokenDictionary, groupNames = '') {
  const result: (Token | string)[] = [];

  recordForEach(groupOrTokenIds, (childGroupOrTokenIds, groupOrTokenIdsKey) => {
    if (Array.isArray(childGroupOrTokenIds)) {
      // A collection can have token without any group. So token generators create an empty group fo them.
      // But we don't need to show the empty group in ui
      groupOrTokenIdsKey.startsWith('__') ? result.push('') : result.push(groupNames + groupOrTokenIdsKey);

      childGroupOrTokenIds.forEach((tokenId: TokenId) => {
        result.push(tokenDictionary.tokenMap[tokenId]);
      });
    } else {
      const currentGroupNames = groupOrTokenIdsKey.startsWith('__')
        ? groupNames + '/'
        : groupNames + groupOrTokenIdsKey + '/';
      result.push(...getTokenList(childGroupOrTokenIds, tokenDictionary, currentGroupNames));
    }
  });

  return result;
}
