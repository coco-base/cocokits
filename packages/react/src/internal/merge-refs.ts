import type { Ref, RefCallback } from 'react';

function assign<T>(ref: Ref<T> | undefined, node: T | null): (() => void) | undefined {
  if (typeof ref === 'function') {
    const cleanup = ref(node) as unknown;
    return typeof cleanup === 'function' ? (cleanup as () => void) : undefined;
  }
  if (ref) ref.current = node;
  return undefined;
}

/**
 * Merges object and callback refs into one callback ref. A callback ref that returns a cleanup
 * is cleaned up instead of being called with `null`.
 *
 * @param refs - The refs to fill; `undefined` and `null` are skipped.
 * @returns A callback ref that returns one cleanup for all of them.
 */
export function mergeRefs<T>(...refs: readonly (Ref<T> | undefined)[]): RefCallback<T> {
  return (node) => {
    const cleanups = refs.map((ref) => assign(ref, node));
    return () => {
      refs.forEach((ref, index) => {
        const cleanup = cleanups[index];
        if (cleanup) cleanup();
        else assign(ref, null);
      });
    };
  };
}
