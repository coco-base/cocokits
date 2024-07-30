import fs from 'fs';

import { reduceMerge } from '@cocokits/common-utils';

import { CollectionDTMTokenMap, CollectionPathMap, DTMTokenGroup } from './design-tokens-manager.model';

/**
 * Reads token JSON files and returns a map where the key is the token path
 * and the value is the content of the json token from `Design Token Manager` Figma plugin.
 * This avoids reading the token file each time it is needed.
 */
export function getCollectionDTMTokenMap(collectionPathMap: CollectionPathMap): CollectionDTMTokenMap {
  const collectionFlatPaths = Object.values(collectionPathMap).flatMap((paths) => paths);

  const jsonMap = reduceMerge(collectionFlatPaths, (tokenPath) => {
    const tokenString = fs.readFileSync(`${tokenPath}`, { encoding: 'utf8' });
    const token = JSON.parse(tokenString) as DTMTokenGroup;
    return { [tokenPath]: token };
  });

  return jsonMap;
}
