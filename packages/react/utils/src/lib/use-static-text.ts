/**
 * A custom hook that returns a static text value. The value remains constant across re-renders
 * unless the provided `defaultValue` changes.
 *
 * @param {string} [defaultValue] - The initial value to be used. If not provided, the current timestamp is used.
 * @returns {string} The static text value.
 *
 * @example
 * // Usage example:
 * function MyComponent() {
 *   const id = useStaticText("component-id");
 *   return <div id={id}>This component has a fixed ID</div>;
 * }
 *
 * // In this example, the `id` will remain "component-id" across re-renders unless the `defaultValue` changes.
 */
import { useRef } from 'react';

export function useStaticText(defaultValue?: string): string {
  const textRef = useRef(defaultValue ?? crypto.randomUUID());

  if (defaultValue?.trim()) {
    textRef.current = defaultValue;
  }

  return textRef.current;
}
