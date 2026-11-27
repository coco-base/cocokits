'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactElement } from 'react';
import { transitionMenuSub, type MenuEvent, type MenuSubTransition } from '@cocokits/machines/menu';
import { useControllableState } from '../internal/use-controllable-state';
import { useIsomorphicLayoutEffect } from '../internal/use-isomorphic-layout-effect';
import { useMenuContext, type MenuContextValue } from './menu-context';
import { MenuSubContext, type MenuSubContextValue } from './menu-part-contexts';
import type { MenuSubChangeDetails, MenuSubProps } from './menu-parts.types';
import type { MenuPart } from './menu.types';
import { useMenuSurface } from './use-menu-surface';

function MenuSubImpl({ open: openProp, defaultOpen = false, onOpenChange, children }: MenuSubProps): ReactElement {
  const parent = useMenuContext('Menu.Sub');
  const id = useId();
  const triggerKey = useId();
  const [open, setOpen, setOpenQuietly] = useControllableState<boolean, MenuSubChangeDetails>({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
    name: '<Menu.Sub open>',
    cancelable: true,
  });
  const [trigger, setTrigger] = useState<HTMLElement | null>(null);
  const [triggerId, setTriggerId] = useState<string | undefined>(undefined);
  const [triggerDisabled, setTriggerDisabled] = useState(false);
  const surface = useMenuSurface(open);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Read by `dispatch`, which listeners and timers created once call.
  const latest = useRef({ open, setOpen, triggerDisabled, trigger });
  useIsomorphicLayoutEffect(() => {
    latest.current = { open, setOpen, triggerDisabled, trigger };
  });

  const cancelPending = useCallback((): void => {
    clearTimeout(timer.current);
    timer.current = undefined;
  }, []);

  const { getItem, setActiveKey, setInitialFocus, notifyPointerMove } = surface;
  const { dispatch: parentDispatch } = parent;
  const apply = useCallback(
    (result: MenuSubTransition, event: Event | null): void => {
      const state = latest.current;
      // A pointer or a click leaves the focus where it is; a key moves it into the submenu.
      if (result.open) setInitialFocus(result.initial ?? 'none');
      const accepted = state.setOpen(result.open, { reason: result.reason, event });
      if (accepted && result.focus === 'trigger') state.trigger?.focus();
    },
    [setInitialFocus],
  );

  const dispatch = useCallback(
    (event: MenuEvent): boolean => {
      if (event.type === 'ITEM.FOCUS') {
        setActiveKey(event.key);
        return true;
      }
      if (event.type === 'ITEM.POINTER_MOVE') {
        notifyPointerMove(event.key, event.event);
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
      if (event.type === 'ITEM.CHECK') return true;
      // An item of the submenu that runs closes the whole menu: the root decides.
      if (event.type === 'ITEM.RUN') return parentDispatch(event);
      const state = latest.current;
      const result = transitionMenuSub({ open: state.open, disabled: state.triggerDisabled }, event);
      // Any later event cancels an open that still waits for the pointer to rest.
      cancelPending();
      if (!result) return true;
      const sent = 'event' in event ? event.event : null;
      if (result.delay === undefined) {
        apply(result, sent);
        return true;
      }
      timer.current = setTimeout(() => {
        timer.current = undefined;
        apply(result, sent);
      }, result.delay);
      return true;
    },
    [getItem, setActiveKey, notifyPointerMove, parentDispatch, cancelPending, apply],
  );

  // The pointer moving to another item of the parent menu closes the submenu.
  const { subscribePointerMove } = parent;
  useIsomorphicLayoutEffect(
    () =>
      subscribePointerMove((key, event) => {
        if (key !== triggerKey) dispatch({ type: 'SUB.PARENT.POINTER_MOVE', event });
      }),
    [subscribePointerMove, triggerKey, dispatch],
  );

  // A closed parent menu closes its submenu, and a waiting open ends.
  useIsomorphicLayoutEffect(() => {
    if (parent.open) return;
    cancelPending();
    setOpenQuietly(false);
  }, [parent.open, cancelPending, setOpenQuietly]);
  useEffect(() => cancelPending, [cancelPending]);

  // Stable while the root trigger is: the content restarts its layer and its focus when this changes.
  const rootTrigger = parent.sub?.rootTrigger ?? parent.trigger;
  const subInfo = useMemo(() => ({ rootTrigger }), [rootTrigger]);
  // What the items and the content of the submenu read as their menu: its own items, its own open state.
  const menu = useMemo<MenuContextValue>(
    () => ({
      ...surface,
      id,
      open,
      keepMounted: parent.keepMounted && surface.keepMounted,
      trigger,
      triggerId,
      setTrigger,
      setTriggerId,
      dispatch,
      sub: subInfo,
    }),
    [surface, id, open, parent.keepMounted, subInfo, trigger, triggerId, dispatch],
  );
  const sub = useMemo<MenuSubContextValue>(
    () => ({
      id,
      triggerKey,
      open,
      mounted: surface.mounted,
      triggerId,
      setTriggerId,
      setTrigger,
      setTriggerDisabled,
      dispatch,
      cancelPending,
      menu,
    }),
    [id, triggerKey, open, surface.mounted, triggerId, dispatch, cancelPending, menu],
  );

  return <MenuSubContext.Provider value={sub}>{children}</MenuSubContext.Provider>;
}

/**
 * One submenu inside a menu. The Sub renders no element; it holds the open state of the submenu and links its
 * `Menu.SubTrigger` and `Menu.SubContent`. Put it among the items of a `Menu.Content`, or of another submenu.
 *
 * The submenu opens at the bottom-end corner of the sub-trigger. With no room there, it moves to the start side,
 * then above.
 *
 * It opens on a click, on Enter or Space, and on the arrow key that points to the content. It also opens when the
 * pointer rests on the sub-trigger.
 *
 * It closes when the pointer moves to another item of the parent menu, and on Escape, which closes only the
 * submenu. It also closes on the arrow key that points back. Focus then returns to the sub-trigger. An item of the
 * submenu closes the whole menu.
 *
 * Control the open state with `open` and `onOpenChange`, or set `defaultOpen` and let the submenu keep it. A closed
 * parent menu closes its submenus.
 *
 * @example
 * <Menu.Sub>
 *   <Menu.SubTrigger>Share</Menu.SubTrigger>
 *   <Menu.SubContent>
 *     <Menu.Item>Email</Menu.Item>
 *     <Menu.Item>Link</Menu.Item>
 *   </Menu.SubContent>
 * </Menu.Sub>
 * @cckPart sub
 * @param props - The Sub props.
 * @returns The children inside the providers.
 */
export const MenuSub: MenuPart<MenuSubProps> = Object.assign(MenuSubImpl, {
  displayName: 'Menu.Sub',
});
