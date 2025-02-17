import { useRef } from 'react';

/**
 * A custom hook that manages state without triggering re-renders when the state changes.
 * This is useful for storing values that need to persist across renders but do not require
 * the component to update when the value changes.
 *
 * @template T The type of the stored value.
 * @param {T} [initValue] - The initial value for the state. If not provided, the initial value will be `null`.
 * @returns {[T | null, (value: T | null) => void]} - A tuple containing the current value and a function to update it.
 *
 * @example
 * // Example usage in a functional component
 * function MyComponent() {
 *   const [value, setValue] = useSilentState<string>("initial");
 *
 *   useEffect(() => {
 *     // Update the value without causing a re-render
 *     setValue("updated");
 *   }, []);
 *
 *   return (
 *     <div>
 *       <p>Current value: {value}</p>
 *       <button onClick={() => setValue("new value")}>Update Value</button>
 *     </div>
 *   );
 * }
 */
export function useSilentState<T>(initValue?: T) {
  const ref = useRef<T | null>(initValue ?? null);

  const seRef = (value: T | null) => {
    ref.current = value;
  };

  return [ref.current, seRef] as const;
}
