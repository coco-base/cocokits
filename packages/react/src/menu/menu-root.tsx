'use client';

import { useCallback, useId, useMemo, useRef, useState, type ReactElement } from 'react';
import { createPresence, type Presence } from '@cocokits/cdk/presence';
import { createTypeahead } from '@cocokits/cdk/roving-focus';
import { transitionMenu, type MenuEvent } from '@cocokits/machines/menu';
import { useControllableState } from '../internal/use-controllable-state';
import { useIsomorphicLayoutEffect } from '../internal/use-isomorphic-layout-effect';
import { MenuContext, type MenuContextValue } from './menu-context';
import { useMenuRegistry } from './use-menu-registry';
import type { MenuChangeDetails, MenuPart, MenuRootProps } from './menu.types';

function MenuRootImpl({ open: openProp, defaultOpen = false, onOpenChange, children }: MenuRootProps): ReactElement {
  const id = useId();
  const [open, setOpen] = useControllableState<boolean, MenuChangeDetails>({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
    name: '<Menu.Root open>',
    cancelable: true,
  });
  const [trigger, setTrigger] = useState<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [exited, setExited] = useState(true);
  const [activeKey, setActiveKey] = useState<string | undefined>(undefined);
  const [typeahead] = useState(() => createTypeahead());
  const registry = useMenuRegistry();
  const contentRef = useRef<HTMLElement | null>(null);
  const initialFocus = useRef<'first' | 'last'>('first');

  // Read by `dispatch` and the item cleanups, which the dismissal listeners and refs created once call.
  const latest = useRef({ id, open, setOpen });
  useIsomorphicLayoutEffect(() => {
    latest.current = { id, open, setOpen };
  });

  const { getItem, register } = registry;
  const dispatch = useCallback(
    (event: MenuEvent): boolean => {
      if (event.type === 'ITEM.FOCUS') {
        setActiveKey(event.key);
        return true;
      }
      if (event.type === 'CONTENT.MOVE') {
        getItem(event.key)?.focus();
        return true;
      }
      if (event.type === 'ITEM.PRESS') {
        getItem(event.key)?.click();
        return true;
      }
      const state = latest.current;
      const next = transitionMenu({ id: state.id, open: state.open }, event);
      if (!next) return true;
      if (next.open) initialFocus.current = next.initial ?? 'first';
      return state.setOpen(next.open, { reason: next.reason, event: event.event });
    },
    [getItem],
  );

  // An item that has focus and goes away while the menu stays open hands the focus to the content.
  const registerItem = useCallback(
    (key: string, element: HTMLElement) => {
      const remove = register(key, element);
      return () => {
        const focused = element.ownerDocument.activeElement === element;
        remove();
        if (focused && latest.current.open) contentRef.current?.focus();
      };
    },
    [register],
  );

  const takeInitialFocus = useCallback((): 'first' | 'last' => {
    const initial = initialFocus.current;
    initialFocus.current = 'first';
    return initial;
  }, []);

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

  const context = useMemo<MenuContextValue>(
    () => ({
      id,
      open,
      mounted,
      keepMounted: open || (mounted && !exited),
      trigger,
      keys: registry.keys,
      activeKey,
      typeahead,
      setTrigger,
      setMounted,
      contentRef,
      registerItem,
      getEntries: registry.getEntries,
      getItem,
      takeInitialFocus,
      dispatch,
    }),
    [
      id,
      open,
      mounted,
      exited,
      trigger,
      registry.keys,
      registry.getEntries,
      activeKey,
      typeahead,
      registerItem,
      getItem,
      takeInitialFocus,
      dispatch,
    ],
  );

  return <MenuContext.Provider value={context}>{children}</MenuContext.Provider>;
}

/**
 * A button that opens a list of actions. The Root renders no element; it gives the open state to its parts.
 *
 * Control the open state with `open` and `onOpenChange`, or set `defaultOpen` and let the menu keep it.
 *
 * It closes when an item runs, on the trigger, on Escape, on a press outside, and when the focus leaves the menu.
 * Escape closes only the top layer.
 *
 * @example
 * <Menu.Root>
 *   <Menu.Trigger>Actions</Menu.Trigger>
 *   <Menu.Content>
 *     <Menu.Item onSelect={() => edit()}>Edit</Menu.Item>
 *     <Menu.Item disabled>Move</Menu.Item>
 *     <Menu.Item onSelect={() => remove()}>Delete</Menu.Item>
 *   </Menu.Content>
 * </Menu.Root>
 * @cckPart root
 * @param props - The Root props.
 * @returns The children inside the provider.
 */
export const MenuRoot: MenuPart<MenuRootProps> = Object.assign(MenuRootImpl, {
  displayName: 'Menu.Root',
});
