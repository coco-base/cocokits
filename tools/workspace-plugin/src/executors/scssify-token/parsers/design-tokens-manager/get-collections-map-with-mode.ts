import { DTMManifest } from './design-tokens-manager.model';
import { recordReduceMerge } from '../../utils/reduce-merge';
import { LOCAL_STYLE_KEY_NAME, LOCAL_STYLE_MODE_NAME, toName } from './collections-path.util';
import { CollectionsMapWithMode } from '../../token.model';

export function getCollectionsMapWithMode(manifest: DTMManifest): CollectionsMapWithMode {
  const localStyle = {
    [LOCAL_STYLE_KEY_NAME]: [LOCAL_STYLE_MODE_NAME],
  };

  const collectionsMapWithMode = recordReduceMerge(
    manifest.collections,
    (collection, collectionName) => {
      return {
        [collectionName]: Object.keys(collection.modes).map((modeName) => toName(modeName)),
      };
    },
    localStyle
  );

  return collectionsMapWithMode;
}
