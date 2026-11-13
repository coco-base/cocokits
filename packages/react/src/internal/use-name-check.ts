'use client';

import { useCallback, useEffect, useRef, type RefCallback } from 'react';
import { hasAccessibleName } from '@cocokits/utils';
import { isDevelopment } from './dev';

/**
 * Tracks an element and, in development, logs a `CocoKits:` error a frame after mount when it has no accessible
 * name. It runs again when `key` changes, so pass the props that can name the element (`aria-label`,
 * `aria-labelledby`, `title`).
 *
 * @param name - The component name for the message, such as `IconButton`.
 * @param key - A value that changes when the name sources change.
 * @returns The ref to put on the element, merged with the others.
 */
export function useNameCheck(name: string, key: string): RefCallback<HTMLElement> {
  const node = useRef<HTMLElement | null>(null);
  const trackNode = useCallback((element: HTMLElement | null) => {
    node.current = element;
  }, []);
  useEffect(() => {
    if (!isDevelopment()) return undefined;
    const frame = requestAnimationFrame(() => {
      if (node.current && !hasAccessibleName(node.current)) {
        console.error(
          `CocoKits: <${name}> has no accessible name. Add an aria-label, or an aria-labelledby that points to an element with text.`,
        );
      }
    });
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [name, key]);
  return trackNode;
}
