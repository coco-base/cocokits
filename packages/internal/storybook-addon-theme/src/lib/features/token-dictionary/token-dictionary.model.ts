import { TokenCollectionName, TokenId, TokenModeName, TokenType } from '@cocokits/core';

export interface TokenDictionaryValueHierarchy {
  tokenId: TokenId;
  type: TokenType;
  collectionName?: TokenCollectionName;
  modeName?: TokenModeName;
  text: string;
}
