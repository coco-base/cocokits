import { recordReduceMerge } from '@cocokits/common-utils';
import { TokenDictionary } from '@cocokits/core';

export function getCollectionFirstModeNames(tokenDictionary: TokenDictionary) {
  return recordReduceMerge(tokenDictionary.collectionModeNames, (modeNames, collectionName) => ({
    [collectionName]: modeNames[0].name,
  }));
}
