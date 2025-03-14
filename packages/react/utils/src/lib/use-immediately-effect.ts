import { DependencyList, EffectCallback, useEffect, useRef } from 'react';

/**
 * A custom hook that runs an effect callback immediately during render and then again
 * after dependency changes like a normal useEffect.
 *
 * Unlike standard useEffect which only runs after render completion, this hook
 * executes the callback during the initial render and then behaves like useEffect
 * for subsequent dependency changes.
 *
 * @param {EffectCallback} effectCallback - The effect function to run immediately and on dependency changes
 * @param {DependencyList} [deps] - Optional dependencies array that controls when the effect reruns
 *
 * @example
 * // Usage example:
 * function DataLoader({ resourceId }) {
 *   const [data, setData] = useState(null);
 *
 *   // This runs immediately during render and again when resourceId changes
 *   useImmediatelyEffect(() => {
 *     fetchData(resourceId).then(setData);
 *   }, [resourceId]);
 *
 *   return data ? <DisplayData data={data} /> : <Loading />;
 * }
 *
 * @warning
 * Use with caution as this breaks the typical React rendering lifecycle by executing
 * side effects during render. This may cause unexpected behavior with React's concurrent mode.
 */
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
