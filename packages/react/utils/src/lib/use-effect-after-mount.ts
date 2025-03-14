import { DependencyList, EffectCallback, useEffect, useRef } from 'react';

/**
 * A custom hook that runs an effect callback only after the initial mount.
 * Unlike useEffect, this hook skips executing the callback on the first render.
 *
 * @param {EffectCallback} effectCallback - The effect function to run after mount and when dependencies change
 * @param {DependencyList} [deps] - Optional dependencies array that controls when the effect runs
 *
 * @example
 * // Usage example:
 * function Counter({ value }) {
 *   const [count, setCount] = useState(value);
 *
 *   // This will only run when 'value' changes, not on initial mount
 *   useEffectAfterMount(() => {
 *     setCount(value);
 *   }, [value]);
 *
 *   return <div>{count}</div>;
 * }
 */
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
