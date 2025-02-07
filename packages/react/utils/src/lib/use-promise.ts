import { useState } from 'react';

import { useImmediatelyEffect } from './use-immediately-effect';

export interface PromiseState<T> {
  loading: boolean;
  error: any;
  result: T | null;
}
export function usePromise<T>(promiseFn: () => Promise<T>) {
  const [state, setState] = useState<PromiseState<T>>({
    loading: true,
    error: null,
    result: null,
  });

  useImmediatelyEffect(() => {
    promiseFn()
      .then((result) => {
        setState({
          loading: false,
          error: null,
          result,
        });
      })
      .catch((error) => {
        setState({
          loading: false,
          error,
          result: null,
        });
      });
  }, [promiseFn]);

  return state;
}
