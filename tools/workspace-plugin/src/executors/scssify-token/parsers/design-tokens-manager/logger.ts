import { CollectionPathMap } from './design-tokens-manager.model';
import { Logger } from '../../../../utils/logger';
import { recordForEach } from '../../utils/record-for-each';

export function logStartParsing(collectionPathMap: CollectionPathMap) {
  Logger.log(`Start parsing following files`);
  recordForEach(collectionPathMap, (paths) => {
    paths.forEach((tokenPath) => Logger.success(`  - ${tokenPath}`));
  });
}

export function logEndParsing() {
  Logger.log(`Parsing has finished`);
}
