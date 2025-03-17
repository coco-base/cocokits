/* eslint-disable no-console */
import { useEffect, useRef } from 'react';

let NEXT_ID = 0;

/**
 * A custom hook that logs debug information for the component lifecycle and change events.
 *
 * @param {string} prefix - A text prefix for the debug logs.
 * @param {any[]} [changes] - An optional array of dependencies. Debug messages are logged when these values change.
 *
 * @example
 * // Usage example:
 * function MyComponent({ propA, propB }) {
 *   useDebug("MyComponent", [propA, propB]);
 *   return <div>Hello, world!</div>;
 * }
 *
 * In this example, the hook logs when the component is mounted, unmounted, and whenever the values in `changes` update.
 */
export function useDebug(prefix: string, changes: any[] = []) {
  const id = useRef(NEXT_ID++);

  changes.forEach((change, index) => {
    console.log(`[DEBUG - ${prefix} - ${id.current}]: Rerender ${index}`, change);
  });

  useEffect(() => {
    console.log(`[DEBUG - ${prefix} - ${id.current}]: Init`);

    return () => {
      console.log(`[DEBUG - ${prefix} - ${id.current}]: Destroy`);
    };
  }, []);

  useEffect(() => {
    changes.forEach((change, index) => {
      console.log(`[DEBUG - ${prefix} - ${id.current}]: Effect Changes ${index}`, change);
    });
  }, changes);
}
