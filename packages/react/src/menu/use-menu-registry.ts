'use client';

import { useCallback, useRef, useState } from 'react';
import type { MenuItemEntry } from '@cocokits/machines/menu';

/** What {@link useMenuRegistry} returns. */
export interface MenuRegistry {
  /** The keys of the registered items in DOM order, as state, so the tab stop follows the items. */
  readonly keys: readonly string[];
  /** Registers an item element under its key; the returned function removes it. */
  readonly register: (key: string, element: HTMLElement) => () => void;
  /** The items in DOM order, with the text and the disabled state read from their elements now. */
  readonly getEntries: () => readonly MenuItemEntry[];
  /** The element of an item. */
  readonly getItem: (key: string) => HTMLElement | undefined;
}

const sameKeys = (a: readonly string[], b: readonly string[]): boolean =>
  a.length === b.length && a.every((key, index) => key === b[index]);

/**
 * Keeps the DOM nodes of the items of one menu. Items register from a ref callback, never during render. The
 * entries are read from the nodes when a key is pressed, so they are never stale.
 *
 * @returns The registry.
 */
export function useMenuRegistry(): MenuRegistry {
  const nodes = useRef(new Map<string, HTMLElement>());
  const [keys, setKeys] = useState<readonly string[]>([]);

  const ordered = useCallback((): [string, HTMLElement][] => {
    return [...nodes.current.entries()].sort(([, a], [, b]) =>
      a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
    );
  }, []);

  const sync = useCallback(() => {
    const next = ordered().map(([key]) => key);
    setKeys((current) => (sameKeys(current, next) ? current : next));
  }, [ordered]);

  const register = useCallback(
    (key: string, element: HTMLElement) => {
      nodes.current.set(key, element);
      sync();
      return () => {
        if (nodes.current.get(key) === element) nodes.current.delete(key);
        sync();
      };
    },
    [sync],
  );

  const getEntries = useCallback(
    (): readonly MenuItemEntry[] =>
      ordered().map(([key, element]) => ({
        key,
        text: element.textContent,
        disabled: element.getAttribute('aria-disabled') === 'true',
      })),
    [ordered],
  );

  const getItem = useCallback((key: string) => nodes.current.get(key), []);

  return { keys, register, getEntries, getItem };
}
