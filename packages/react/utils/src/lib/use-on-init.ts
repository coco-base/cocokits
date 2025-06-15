import { useRef } from 'react';

/**
 * A custom hook that runs a callback function only once when the component is initialized.
 * This is useful for performing setup tasks that should only happen once, such as initializing state or fetching data.
 *
 * @param {() => void} callback - The function to run on initialization.
 *
 * @example
 * // Usage example:
 * function MyComponent() {
 *   useOnInit(() => {
 *     console.log('Component initialized');
 *   });
 *
 *   return <div>My Component</div>;
 * }
 */
export function useOnInit(callback: () => void) {
  const hasInitialized = useRef(false);

  if (!hasInitialized.current) {
    callback();
    hasInitialized.current = true;
  }
}
