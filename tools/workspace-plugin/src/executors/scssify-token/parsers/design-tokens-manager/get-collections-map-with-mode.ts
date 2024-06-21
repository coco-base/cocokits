import { LOCAL_STYLE_KEY_NAME, LOCAL_STYLE_MODE_NAME, toName } from './collections-path.util';
import { DTMManifest } from './design-tokens-manager.model';
import { CollectionsMapWithMode } from '../../token.model';
import { recordReduceMerge } from '../../utils/reduce-merge';

export function getCollectionsMapWithMode(manifest: DTMManifest): CollectionsMapWithMode {
  const localStyle = {
    [LOCAL_STYLE_KEY_NAME]: [LOCAL_STYLE_MODE_NAME],
  };

  const collectionsMapWithMode = recordReduceMerge(
    manifest.collections,
    (collection, collectionName) => {
      return {
        [toName(collectionName)]: Object.keys(collection.modes).map((modeName) => toName(modeName)),
      };
    },
    localStyle
  );

  return collectionsMapWithMode;
}
