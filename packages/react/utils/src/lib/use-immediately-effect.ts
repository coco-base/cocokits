import { DependencyList, EffectCallback, useEffect, useRef } from 'react';

export const useImmediatelyEffect = (effectCallback: EffectCallback, deps?: DependencyList) => {
  const hasInitialized = useRef(false);

  if (!hasInitialized.current) {
    effectCallback();
  }

  useEffect(() => {
    if (hasInitialized.current) {
      effectCallback();
    }
    hasInitialized.current = true;
  }, deps);
};
