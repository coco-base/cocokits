import { createContext, useContext, useRef } from 'react';

import { ClassRef } from '@cocokits/common-utils';

export function createFeatureStore<T extends ClassRef>(featureStoreRef: T) {
  const Context = createContext<InstanceType<T> | null>(null);
  const useFeatureStore = () => useContext(Context);
  const useCreateFeatureStore = (...config: ConstructorParameters<T>) => {
    const storeRef = useRef<{
      StoreProvider: typeof Context.Provider;
      store: InstanceType<T>;
    }>();

    if (!storeRef.current) {
      storeRef.current = {
        StoreProvider: Context.Provider,
        store: new featureStoreRef(...config),
      };
    }

    return storeRef.current;
  };

  return { useFeatureStore, useCreateFeatureStore };
}
