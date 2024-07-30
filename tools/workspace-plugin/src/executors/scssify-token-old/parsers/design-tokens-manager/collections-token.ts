import { recordReduceMerge } from '@cocokits/common-utils';

import {
  CollectionDTMTokenMap,
  CollectionPathMap,
  DTMGroupOrValue,
  DTMTokenGroup,
  DTMValue,
} from './design-tokens-manager.model';
import { DesignToken, DesignTokenCollectionMap, DesignTokenType } from '../../token.model';

/**
 * Converts tokens from `Design Token Manager` format to our workspace standard design token format
 * by removing unnecessary properties and converting them to our workspace standard format.
 */
export function getStandardDesignTokenCollectionsMap(
  collectionPathMap: CollectionPathMap,
  collectionsJson: CollectionDTMTokenMap,
  skipTokenTypes: DesignTokenType[]
): DesignTokenCollectionMap {
  const designTokenCollections: DesignTokenCollectionMap = recordReduceMerge(
    collectionPathMap,
    (tokenPaths, collectionWithModeName) => {
      const designTokens = tokenPaths.flatMap((tokenPath) => {
        const token = collectionsJson[tokenPath];
        const tokens = Object.entries(token).flatMap(([name, tokenGroup]) =>
          toStandardToken(toName(name), tokenGroup, skipTokenTypes)
        );
        return tokens;
      });

      return designTokens.length !== 0 ? { [collectionWithModeName]: designTokens } : {};
    }
  );

  return designTokenCollections;
}

function toStandardToken(tokenName: string, token: DTMGroupOrValue, skipTokenTypes: DesignTokenType[]): DesignToken[] {
  if (hasTokenValue(token)) {
    if (skipTokenTypes.includes(token.$type)) {
      return [];
    }

    return [
      {
        namePath: [toName(tokenName)],
        value: toValue(token),
        type: token.$type as DesignTokenType,
      },
    ];
  }

  return Object.entries(token).flatMap(([name, tokenValueOrGroup]) => {
    return toStandardToken(name.toLowerCase(), tokenValueOrGroup, skipTokenTypes).map((token2) => ({
      ...token2,
      namePath: [tokenName, ...token2.namePath],
    }));
  });
}

function hasTokenValue(token: DTMTokenGroup | DTMValue): token is DTMValue {
  return '$value' in token;
}

function toName(name: string): string {
  return name.replaceAll(' ', '-').toLowerCase().trim();
}

function toValue(value: DTMValue): any {
  switch (value.$type) {
    // TODO: Add more values
    case DesignTokenType.Shadow:
      return 'backgroundBlue' in value.$value[0]
        ? { blur: value.$value[0].blur } // Blur
        : value.$value; // Shadow

    default:
      return value.$value;
  }
}
