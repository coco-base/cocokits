import { getCollectionDTMTokenMap } from './collection-dtm-token';
import { getCollectionPathMap } from './collections-path.util';
import { getStandardDesignTokenCollectionsMap } from './collections-token';
import { logEndParsing, logStartParsing } from './logger';
import { getManifest } from './manifest.util';
import { getTokenDefinitionMap } from './token-definition';
import { ScssifyTokenExecutorSchema } from '../../schema';
import { DesignTokenCollectionMap, ParserResult } from '../../token.model';

export function parseDesignTokensManager(options: ScssifyTokenExecutorSchema): ParserResult {
  const manifest = getManifest(options.files);
  const collectionPathMap = getCollectionPathMap(manifest, options);

  logStartParsing(collectionPathMap);

  const collectionsJson = getCollectionDTMTokenMap(collectionPathMap);

  const designTokenCollections: DesignTokenCollectionMap = getStandardDesignTokenCollectionsMap(
    collectionPathMap,
    collectionsJson,
    options.skipTokenTypes
  );

  const tokenDefinitionMap = getTokenDefinitionMap(collectionPathMap, collectionsJson);

  logEndParsing();

  return { designTokenCollections, tokenDefinitionMap };
}
