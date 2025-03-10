import { DependencyList, EffectCallback, useEffect, useRef } from 'react';

export const useEffectAfterMount = (effectCallback: EffectCallback, deps?: DependencyList) => {
  const isInitial = useRef(true);

  useEffect(() => {
    if (isInitial.current) {
      isInitial.current = false;
    } else {
      effectCallback();
    }
  }, deps);
};
