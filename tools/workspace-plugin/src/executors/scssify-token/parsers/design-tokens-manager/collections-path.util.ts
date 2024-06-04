import path from 'path';

import { CollectionPathMap, DTMManifest } from './design-tokens-manager.model';
import { ScssifyTokenExecutorSchema } from '../../schema';
import { recordReduceMerge } from '../../utils/reduce-merge';

/**
 * Extracts token paths from the manifest and saves them in a flat map to avoid handling deeply nested token paths.
 * @return CollectionPathMap
 * Return Example: {
 *   global: [ '*.tokens.json' ],
 *   'sizing.compact': [ '*.tokens.json' ],
 *   'sizing.spacious': [ '*.tokens.json' ],
 *   'color-theme.theme-a': [ '*.tokens.json' ],
 *   'color-theme.theme-b': [ '*.tokens.json' ]
 * }
 *
 */
export function getCollectionPathMap(manifest: DTMManifest, options: ScssifyTokenExecutorSchema): CollectionPathMap {
  const globalCollectionPathMap = getGlobalCollectionPathMap(manifest, options);
  const customCollectionsPathMap = getCustomCollectionPathMap(manifest, options);

  return {
    ...customCollectionsPathMap,
    ...globalCollectionPathMap,
  };
}

/**
 * Extracts global token paths from the manifest (`manifest.styles`) and saves them in a flat map.
 * @return CollectionPathMap
 * Return Example: {
 *   global: [ '*.tokens.json' ],
 * }
 *
 */
function getGlobalCollectionPathMap(manifest: DTMManifest, options: ScssifyTokenExecutorSchema): CollectionPathMap {
  const pathMap: Record<string, string[]> = {
    global: Object.values(manifest.styles).flatMap((tokenFiles) => toTokenPaths(tokenFiles, options)),
  };

  return pathMap;
}

/**
 * Extracts collection token paths from the manifest (`manifest.collections`) and saves them in a flat map.
 * @return CollectionPathMap
 * Return Example: {
 *  'sizing.compact': [ '*.tokens.json' ],
 *  'sizing.spacious': [ '*.tokens.json' ],
 *  'color-theme.theme-a': [ '*.tokens.json' ],
 *  'color-theme.theme-b': [ '*.tokens.json' ]
 * }
 *
 */
function getCustomCollectionPathMap(manifest: DTMManifest, options: ScssifyTokenExecutorSchema) {
  const pathMap = recordReduceMerge(manifest.collections, (collectionValue, collectionName) => {
    const collectionModePathMap = recordReduceMerge(collectionValue.modes, (paths, modeName) =>
      toCollectionModePaths({ paths, modeName, collectionName, options })
    );
    return collectionModePathMap;
  });

  return pathMap;
}

/**
 * Merges the collection and mode name, and sets the key of the returned map.
 * The value of the key will be the absolute path of the token.
 */
function toCollectionModePaths({
  paths,
  modeName,
  collectionName,
  options,
}: {
  paths: string[];
  modeName: string;
  collectionName: string;
  options: ScssifyTokenExecutorSchema;
}) {
  return { [`${toName(collectionName)}.${toName(modeName)}`]: toTokenPaths(paths, options) };
}

/**
 * Converts token relative paths to their absolute paths.
 */
function toTokenPaths(paths: string[], options: ScssifyTokenExecutorSchema) {
  return paths
    .map((tokenFile) => path.join(path.dirname(options.files[0]), tokenFile))
    .filter((tokenFile) => !options.exclude.includes(tokenFile));
}

/**
 * Converts a name of collection or mode to a sanitized format by replacing spaces with hyphens and converting to lowercase.
 */
function toName(name: string): string {
  return name.replaceAll(' ', '-').toLowerCase().trim();
}
