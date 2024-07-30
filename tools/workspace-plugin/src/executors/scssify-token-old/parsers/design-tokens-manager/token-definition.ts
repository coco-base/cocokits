import { recordReduceDeepMerge, reduceDeepMerge } from '@cocokits/common-utils';

import { CollectionDTMTokenMap, CollectionPathMap } from './design-tokens-manager.model';
import { TokenDefinitionMap } from '../../token.model';

/**
 * Generates a map that links token group names to their corresponding definitions from a collection and mode.
 *
 * @example
 * {
 *    spacing: ['sizing.compact', 'sizing.spacious'],
 *    colors: ['color-mode.light', 'color-mode.dark']
 * }
 */
export function getTokenDefinitionMap(
  collectionPathMap: CollectionPathMap,
  collectionsJson: CollectionDTMTokenMap
): TokenDefinitionMap {
  // e.g: { spacing: ['sizing.compact', 'sizing.spacious'], colors: ['color-mode.light', 'color-mode.dark'] }
  const tokenDefinitionMap: TokenDefinitionMap = recordReduceDeepMerge(
    collectionPathMap,
    (tokenPaths, collectionWithModeName) => {
      // e.g: { sizing: ['sizing.compact', 'sizing.spacious'] }
      const singleCollectionTokenDefinitionMap: TokenDefinitionMap = reduceDeepMerge(tokenPaths, (tokenPath) => {
        const token = collectionsJson[tokenPath];
        const tokenVariableNames = Object.keys(token);

        // e.g: { sizing: ['sizing.compact'] }
        const singleTokenFileDefinitionMap: TokenDefinitionMap = reduceDeepMerge(
          tokenVariableNames,
          (tokenVariableName) => {
            return { [tokenVariableName]: [collectionWithModeName] };
          }
        );

        return singleTokenFileDefinitionMap;
      });

      return singleCollectionTokenDefinitionMap;
    }
  );

  return tokenDefinitionMap;
}
