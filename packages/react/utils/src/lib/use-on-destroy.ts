import { useEffect } from 'react';

/**
 * A custom hook that runs a callback function when the component is destroyed.
 * This is useful for performing cleanup tasks such as removing event listeners or cancelling subscriptions.
 * It's same as `useEffect` with an empty dependency array, but specifically intended for cleanup actions.
 *
 * @param {() => void} callback - The function to run on component destruction.
 *
 * @example
 * // Usage example:
 * function MyComponent() {
 *   useOnDestroy(() => {
 *     console.log('Component destroyed');
 *   });
 *
 *   return <div>My Component</div>;
 * }
 */
export function useOnDestroy(callback: () => void) {
  useEffect(() => {
    return () => {
      callback();
    };
  }, []);
}
