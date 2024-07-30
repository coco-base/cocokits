import { recordForEach } from '@cocokits/common-utils';

import { CollectionPathMap } from './design-tokens-manager.model';
import { Logger } from '../../../../utils/logger';

export function logStartParsing(collectionPathMap: CollectionPathMap) {
  Logger.log(`Start parsing following files`);
  recordForEach(collectionPathMap, (paths) => {
    paths.forEach((tokenPath) => Logger.success(`  - ${tokenPath}`));
  });
}

export function logEndParsing() {
  Logger.log(`Parsing has finished`);
}
