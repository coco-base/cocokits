'use client';

import { useCallback, useRef, type RefCallback } from 'react';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';

/**
 * A ref callback that gives the element of a control the methods of its handle (`focus()` and `reset()`). The
 * methods are defined on the element itself, so `ref` stays the element that a forms library registers, and they
 * always run the latest version of the function. Internal.
 *
 * @param methods - The methods to put on the element, by name.
 * @returns The ref callback to merge into the element's refs.
 */
export function useControlHandle<E extends HTMLElement>(methods: Readonly<Record<string, () => void>>): RefCallback<E> {
  const latest = useRef(methods);
  useIsomorphicLayoutEffect(() => {
    latest.current = methods;
  });
  return useCallback((node: E | null) => {
    if (node === null) return;
    for (const name of Object.keys(latest.current)) {
      Object.defineProperty(node, name, {
        configurable: true,
        value: () => {
          latest.current[name]();
        },
      });
    }
  }, []);
}
