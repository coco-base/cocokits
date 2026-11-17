'use client';

import { useCallback, useId, useMemo, useRef, useState, type ReactElement } from 'react';
import { transitionMenu, type MenuEvent } from '@cocokits/machines/menu';
import { useControllableState } from '../internal/use-controllable-state';
import { useIsomorphicLayoutEffect } from '../internal/use-isomorphic-layout-effect';
import { MenuContext, type MenuContextValue } from './menu-context';
import { useMenuSurface } from './use-menu-surface';
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
  const [triggerId, setTriggerId] = useState<string | undefined>(undefined);
  const surface = useMenuSurface(open);

  // Read by `dispatch`, which the dismissal listeners created once call.
  const latest = useRef({ id, open, setOpen });
  useIsomorphicLayoutEffect(() => {
    latest.current = { id, open, setOpen };
  });

  const { getItem, setActiveKey, setInitialFocus, notifyPointerMove } = surface;
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
      // The submenu events belong to the submenu, and a checkbox or radio item applies its own change on Space.
      if (event.type === 'ITEM.CHECK' || event.type.startsWith('SUB.')) return true;
      const state = latest.current;
      const next = transitionMenu({ id: state.id, open: state.open }, event);
      if (!next) return true;
      if (next.open) setInitialFocus(next.initial ?? 'first');
      return state.setOpen(next.open, { reason: next.reason, event: event.event });
    },
    [getItem, setActiveKey, setInitialFocus, notifyPointerMove],
  );

  const context = useMemo<MenuContextValue>(
    () => ({ ...surface, id, open, trigger, triggerId, setTriggerId, setTrigger, dispatch, sub: null }),
    [surface, id, open, trigger, triggerId, dispatch],
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
 * @example
 * <Menu.Root>
 *   <Menu.Trigger>View</Menu.Trigger>
 *   <Menu.Content>
 *     <Menu.Group>
 *       <Menu.GroupLabel>Layout</Menu.GroupLabel>
 *       <Menu.CheckboxItem defaultChecked><Menu.ItemIndicator /> Grid</Menu.CheckboxItem>
 *       <Menu.RadioGroup defaultValue="name">
 *         <Menu.RadioItem value="name"><Menu.ItemIndicator /> Name</Menu.RadioItem>
 *         <Menu.RadioItem value="date"><Menu.ItemIndicator /> Date</Menu.RadioItem>
 *       </Menu.RadioGroup>
 *     </Menu.Group>
 *     <Menu.Item>
 *       <Menu.ItemLeading><SvgIcon iconName="copy" /></Menu.ItemLeading>
 *       Duplicate
 *       <Menu.ItemSupportingText>Makes a copy.</Menu.ItemSupportingText>
 *       <Menu.ItemShortcut>Ctrl D</Menu.ItemShortcut>
 *       <Menu.ItemTrailing><SvgIcon iconName="chevron-right" /></Menu.ItemTrailing>
 *     </Menu.Item>
 *     <Menu.Sub>
 *       <Menu.SubTrigger>More</Menu.SubTrigger>
 *       <Menu.SubContent><Menu.Item>Export</Menu.Item></Menu.SubContent>
 *     </Menu.Sub>
 *   </Menu.Content>
 * </Menu.Root>
 * @cckPart root
 * @param props - The Root props.
 * @returns The children inside the provider.
 */
export const MenuRoot: MenuPart<MenuRootProps> = Object.assign(MenuRootImpl, {
  displayName: 'Menu.Root',
});
