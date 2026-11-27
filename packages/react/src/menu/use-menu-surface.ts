'use client';

import { useCallback, useMemo, useRef, useState, type RefObject } from 'react';
import { createPresence, type Presence } from '@cocokits/cdk/presence';
import { createTypeahead, type Typeahead } from '@cocokits/cdk/roving-focus';
import { useIsomorphicLayoutEffect } from '../internal/use-isomorphic-layout-effect';
import type { MenuContextValue } from './menu-context';
import { useMenuRegistry } from './use-menu-registry';

/** Which item focus goes to when a menu surface opens; `none` leaves the focus where it is (a pointer opened it). */
export type MenuInitialFocus = 'first' | 'last' | 'none';

/** A listener of the pointer moving over an item of the menu; the item's key and the event. */
export type MenuPointerListener = (key: string, event: Event) => void;

/** What {@link useMenuSurface} returns: the part of the context that the menu and a submenu both hold. */
export interface MenuSurface extends Pick<
  MenuContextValue,
  | 'mounted'
  | 'keepMounted'
  | 'keys'
  | 'activeKey'
  | 'typeahead'
  | 'setMounted'
  | 'contentRef'
  | 'registerItem'
  | 'getEntries'
  | 'getItem'
  | 'takeInitialFocus'
  | 'subscribePointerMove'
> {
  /** Makes an item the active one. */
  readonly setActiveKey: (key: string) => void;
  /** Sets the item focus goes to on the next open. */
  readonly setInitialFocus: (initial: MenuInitialFocus) => void;
  /** Tells the listeners that the pointer moved over the item with this key. */
  readonly notifyPointerMove: MenuPointerListener;
}

/**
 * The state that a menu and a submenu share: the items and their order, the active item, the typeahead buffer,
 * the content element, whether the content is in the document (with its exit animation) and the pointer
 * listeners. It holds no open model; the caller owns it.
 *
 * @param open - The open model of the surface.
 * @returns The shared state.
 */
export function useMenuSurface(open: boolean): MenuSurface {
  const [mounted, setMounted] = useState(false);
  const [exited, setExited] = useState(true);
  const [activeKey, setActiveKey] = useState<string | undefined>(undefined);
  const [typeahead] = useState<Typeahead>(() => createTypeahead());
  const registry = useMenuRegistry();
  const contentRef: RefObject<HTMLElement | null> = useRef<HTMLElement | null>(null);
  const initialFocus = useRef<MenuInitialFocus>('first');
  const [listeners] = useState(() => new Set<MenuPointerListener>());

  // Read by the item cleanups, which refs created once call.
  const openNow = useRef(open);
  useIsomorphicLayoutEffect(() => {
    openNow.current = open;
  });

  // An item that has focus and goes away while the surface stays open hands the focus to the content.
  const { getItem, register } = registry;
  const registerItem = useCallback(
    (key: string, element: HTMLElement) => {
      const remove = register(key, element);
      return () => {
        const focused = element.ownerDocument.activeElement === element;
        remove();
        if (focused && openNow.current) contentRef.current?.focus();
      };
    },
    [register],
  );

  const takeInitialFocus = useCallback((): MenuInitialFocus => {
    const initial = initialFocus.current;
    initialFocus.current = 'first';
    return initial;
  }, []);
  const setInitialFocus = useCallback((initial: MenuInitialFocus) => {
    initialFocus.current = initial;
  }, []);

  const subscribePointerMove = useCallback(
    (listener: MenuPointerListener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    [listeners],
  );
  const notifyPointerMove = useCallback<MenuPointerListener>(
    (key, event) => {
      for (const listener of listeners) listener(key, event);
    },
    [listeners],
  );

  // The content stays in the document after `open` turns false until the exit animation has finished: it is
  // rendered while it is mounted and the presence has not reported `unmounted`.
  const presence = useRef<Presence | null>(null);
  useIsomorphicLayoutEffect(() => {
    const created = createPresence({
      getElement: () => contentRef.current,
      onStateChange: (state) => {
        setExited(state === 'unmounted');
      },
    });
    presence.current = created;
    return () => {
      created.destroy();
      presence.current = null;
    };
  }, []);
  // After the closed state is rendered, so the exit animation already exists when it is read.
  useIsomorphicLayoutEffect(() => {
    presence.current?.setOpen(open);
  }, [open]);

  const keepMounted = open || (mounted && !exited);
  return useMemo(
    () => ({
      mounted,
      keepMounted,
      keys: registry.keys,
      activeKey,
      typeahead,
      setMounted,
      contentRef,
      registerItem,
      getEntries: registry.getEntries,
      getItem,
      takeInitialFocus,
      subscribePointerMove,
      setActiveKey,
      setInitialFocus,
      notifyPointerMove,
    }),
    [
      mounted,
      keepMounted,
      registry.keys,
      registry.getEntries,
      activeKey,
      typeahead,
      registerItem,
      getItem,
      takeInitialFocus,
      subscribePointerMove,
      setInitialFocus,
      notifyPointerMove,
    ],
  );
}
