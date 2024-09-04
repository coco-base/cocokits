import fs from 'fs';
import path from 'path';

import { recordReduceDeepMerge } from '@cocokits/common-utils';

import { DTMGroupOrValue, DTMManifest, DTMTokenGroup, DTMTokenValue } from './design-tokens-manager.model';
import { getTokenIdFromAliasValue, hasDTMTokenValue, isAliasValue, toName, toRawValue, toTokenId } from './util';
import { TokenGeneratorExecutorSchema } from '../../schema';
import {
  TokenCollectionGroupHierarchy,
  TokenGroupOrTokenIds,
  Token,
  TokenCollectionModeNames,
  TokenCollectionName,
  TokenCollectionNames,
  TokenDictionary,
  TokenId,
  TokenMap,
  TokenModeName,
  TokenRawGroupNamePath,
  TokenRawGroupOrName,
  TokenRawModeName,
  TokenRawName,
} from '@cocokits/core';

/**
 * Generates the base token dictionary from the provided manifest and options.
 * The following properties in tokens are empty and has to be fill out later
 *
 *  - value
 *  - aliasHierarchies
 *  - variables
 */
export function getBaseTokenDictionary(manifest: DTMManifest, options: TokenGeneratorExecutorSchema): TokenDictionary {
  const collectionNames = getCollectionName(manifest);
  const collectionModeNames = getCollectionModeNames(manifest);
  const { tokenMap, collectionGroupHierarchy } = getCollectionGroupsAndTokenMap(manifest, options);

  return {
    collectionNames,
    collectionModeNames,
    tokenMap,
    collectionGroupHierarchy,
  };
}

const LOCAL_STYLE_KEY_NAME: TokenCollectionName = 'local-style';
const LOCAL_STYLE_MODE_NAME: TokenModeName = 'default';

function getCollectionName(manifest: DTMManifest): TokenCollectionNames[] {
  const collections = Object.keys(manifest.collections).map((collectionRawName) => ({
    name: toName(collectionRawName),
    rawName: collectionRawName,
  }));

  return Object.keys(manifest.styles).length > 0
    ? [{ name: LOCAL_STYLE_KEY_NAME, rawName: LOCAL_STYLE_KEY_NAME }, ...collections]
    : collections;
}

function getCollectionModeNames(manifest: DTMManifest) {
  const initializeCollectionModeNames: TokenCollectionModeNames =
    Object.keys(manifest.styles).length > 0
      ? {
          [LOCAL_STYLE_KEY_NAME]: [
            {
              rawName: LOCAL_STYLE_MODE_NAME,
              name: LOCAL_STYLE_MODE_NAME,
            },
          ],
        }
      : {};
  return recordReduceDeepMerge<typeof manifest.collections, TokenCollectionModeNames>(
    manifest.collections,
    (collection, collectionRawName) => {
      return recordReduceDeepMerge<typeof collection.modes, TokenCollectionModeNames>(
        collection.modes,
        (_modePaths, modeRawName) => {
          return {
            [toName(collectionRawName)]: [{ rawName: modeRawName, name: toName(modeRawName) }],
          };
        }
      );
    },
    initializeCollectionModeNames
  );
}

function getCollectionGroupsAndTokenMap(manifest: DTMManifest, options: TokenGeneratorExecutorSchema) {
  // Loop to collections
  const collectionsWithLocalStyle: typeof manifest.collections =
    Object.keys(manifest.styles).length > 0
      ? {
          [LOCAL_STYLE_KEY_NAME]: {
            modes: {
              [LOCAL_STYLE_MODE_NAME]: Object.values(manifest.styles).flatMap((paths) => paths),
            },
          },
          ...manifest.collections,
        }
      : {
          ...manifest.collections,
        };

  return recordReduceDeepMerge<
    typeof manifest.collections,
    {
      tokenMap: TokenMap;
      collectionGroupHierarchy: TokenCollectionGroupHierarchy;
    }
  >(collectionsWithLocalStyle, (collection, collectionRawName) => {
    const collectionName: TokenCollectionName = toName(collectionRawName);
    // Loop to mode of collection
    const { tokenMap, groupHierarchy } = recordReduceDeepMerge<
      typeof collection.modes,
      {
        tokenMap: Record<TokenId, Token>;
        groupHierarchy: TokenGroupOrTokenIds;
      }
    >(collection.modes, (modePaths, modeRawName) => {
      const jsonPath = path.join(path.dirname(options.files[0]), modePaths[0]);
      const dtmTokenGroup = JSON.parse(fs.readFileSync(jsonPath, { encoding: 'utf8' })) as DTMTokenGroup;

      return dtmTokenGroupToStandardTokenGroup({
        dtmTokenGroup,
        modeRawName,
        collectionName,
        options,
      });
    });

    return {
      tokenMap,
      collectionGroupHierarchy: { [collectionName]: groupHierarchy },
      // [toName(collectionRawName)]: tokenGroup
    };
  });
}

function dtmTokenGroupToStandardTokenGroup({
  dtmTokenGroup,
  modeRawName,
  collectionName,
  options,
  tokenRawGroupNamePath = [],
}: {
  dtmTokenGroup: DTMTokenGroup;
  modeRawName: TokenRawModeName;
  collectionName: TokenCollectionName;
  options: TokenGeneratorExecutorSchema;
  tokenRawGroupNamePath?: TokenRawGroupNamePath;
}): {
  tokenMap: Record<TokenId, Token>;
  groupHierarchy: TokenGroupOrTokenIds;
} {
  // Loop to collection modes tokens
  return recordReduceDeepMerge(dtmTokenGroup, (groupOrValue, groupOrTokenName: TokenRawGroupOrName) => {
    validateGroupUniqFormat(groupOrValue);

    if (hasDTMTokenValue(groupOrValue)) {
      const token = dtmTokenToStandardToken({
        dtmTokenValue: groupOrValue,
        tokenRawName: groupOrTokenName,
        tokenRawGroupNamePath: tokenRawGroupNamePath,
        modeRawName: modeRawName,
        collectionName: collectionName,
        options,
      });

      return {
        tokenMap: { [token.id]: token },
        groupHierarchy: generateNestedTokenGroup(tokenRawGroupNamePath, token.id),
      };
    }

    return dtmTokenGroupToStandardTokenGroup({
      dtmTokenGroup: groupOrValue,
      modeRawName,
      collectionName,
      options,
      tokenRawGroupNamePath: [...tokenRawGroupNamePath, groupOrTokenName],
    });
  });
}

function generateNestedTokenGroup(
  tokenRawGroupNamePath: TokenRawGroupNamePath,
  tokenId: TokenId
): TokenGroupOrTokenIds {
  // A collection have tokens without any group. But our interface need each collection to have at list one group.
  // Because of that we crete an empty group to follow our structure
  if (tokenRawGroupNamePath.length === 0) {
    return {
      __emptyGroup: [tokenId],
    };
  }

  const nestedObject: TokenGroupOrTokenIds = {};
  let currentLevel: TokenGroupOrTokenIds | TokenId[] = nestedObject;

  tokenRawGroupNamePath.forEach((tokenRawGroupName, index) => {
    const tokenGroupName = toName(tokenRawGroupName);
    currentLevel[tokenGroupName] = index === tokenRawGroupNamePath.length - 1 ? [tokenId] : {};
    currentLevel = currentLevel[tokenGroupName];
  });

  return nestedObject;
}

function dtmTokenToStandardToken({
  dtmTokenValue,
  tokenRawName,
  tokenRawGroupNamePath,
  modeRawName,
  collectionName,
  options,
}: {
  dtmTokenValue: DTMTokenValue;
  tokenRawName: TokenRawName;
  tokenRawGroupNamePath: TokenRawGroupNamePath;
  modeRawName: TokenRawModeName;
  collectionName: TokenCollectionName;
  options: TokenGeneratorExecutorSchema;
}): Token {
  const rawNamePath = [...tokenRawGroupNamePath, tokenRawName];
  const namePath = rawNamePath.map(toName);
  const modeName = toName(modeRawName);
  return {
    id: toTokenId(namePath),
    collectionName,
    rawNamePath,
    namePath,
    type: dtmTokenValue.$type,
    modes: {
      [modeName]: {
        rawValue: toRawValue(dtmTokenValue, namePath, options),
        value: null,
        aliasTokenId: isAliasValue(dtmTokenValue.$value) ? getTokenIdFromAliasValue(dtmTokenValue.$value) : null,
        aliasHierarchies: null,
      },
    },
    variable: {
      name: null,
      css: null,
      scss: null,
    },
  } satisfies Token;
}

function validateGroupUniqFormat(groupOrValue: DTMGroupOrValue): void {
  let hasFirstDTMTokenValue: boolean;
  const isAllChildrenGroupOrToken = Object.values(groupOrValue).every((childGroupOrToken) => {
    if (hasFirstDTMTokenValue === undefined) {
      hasFirstDTMTokenValue = hasDTMTokenValue(childGroupOrToken);
      return true;
    }

    return hasFirstDTMTokenValue === hasDTMTokenValue(childGroupOrToken);
  });

  if (!isAllChildrenGroupOrToken) {
    throw new Error(
      `All children in a token group must either be tokens or sub-groups, but not a combination of both. The following items are misconfigured: '${Object.keys(
        groupOrValue
      ).join(', ')}'.`
    );
  }
}
