'use client';

import {
  isValidElement,
  useCallback,
  useMemo,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactElement,
  type Ref,
} from 'react';
import { getMenuProps, menuAnatomy, type MenuEvent } from '@cocokits/machines/menu';
import { toReactProps, useDirection, useThemeAttrs } from '@cocokits/react-core';
import { mergeProps, withoutReserved } from '../internal/merge-props';
import { renderElement } from '../internal/render-element';
import { useIsomorphicLayoutEffect } from '../internal/use-isomorphic-layout-effect';
import { useMergedRef } from '../internal/use-merged-ref';
import { useMenuContext } from './menu-context';
import { useMenuSubContext } from './menu-part-contexts';
import type { MenuSubTriggerProps } from './menu-parts.types';
import type { MenuItemState, MenuPart, MenuRenderProps } from './menu.types';

interface ElementProps {
  readonly ref?: Ref<HTMLElement>;
}

/** The attributes the machine owns; a consumer value can never replace them. */
const RESERVED = [
  'id',
  'role',
  'tabIndex',
  'aria-haspopup',
  'aria-expanded',
  'aria-controls',
  'aria-disabled',
  'data-state',
  'data-disabled',
];

function MenuSubTriggerImpl({ disabled = false, render, ref, ...rest }: MenuSubTriggerProps): ReactElement {
  const parent = useMenuContext('Menu.SubTrigger');
  const sub = useMenuSubContext('Menu.SubTrigger');
  const dir = useDirection();
  const themeAttrs = useThemeAttrs(menuAnatomy).subTrigger;
  const { registerItem, dispatch: parentDispatch } = parent;
  const { triggerKey, setTrigger, setTriggerId, setTriggerDisabled, cancelPending } = sub;
  const register = useCallback((node: HTMLElement) => registerItem(triggerKey, node), [registerItem, triggerKey]);
  const elementRef = isValidElement<ElementProps>(render) ? render.props.ref : undefined;
  const mergedRef = useMergedRef<HTMLElement>(
    ref,
    elementRef,
    useMergedRef<HTMLElement>(register, setTrigger, undefined),
  );

  // The submenu names itself by this id, and a disabled sub-trigger never opens it.
  useIsomorphicLayoutEffect(() => {
    setTriggerId(rest.id);
    return () => {
      setTriggerId(undefined);
    };
  }, [setTriggerId, rest.id]);
  useIsomorphicLayoutEffect(() => {
    setTriggerDisabled(disabled);
  }, [setTriggerDisabled, disabled]);

  // The focus belongs to the parent menu, which keeps the tab stop; the rest is about the submenu.
  const send = (event: MenuEvent): void => {
    if (event.type === 'ITEM.FOCUS') parentDispatch(event);
    else sub.dispatch(event);
  };
  const entries = useMemo(() => parent.keys.map((key) => ({ key, text: '' })), [parent.keys]);
  const { subTrigger } = getMenuProps(
    {
      id: parent.id,
      open: parent.open,
      items: entries,
      activeKey: parent.activeKey,
      typeahead: parent.typeahead,
      dir,
    },
    send,
  );
  const machine = subTrigger(
    { key: triggerKey, text: '', disabled },
    { id: sub.id, open: sub.open, mounted: sub.mounted, triggerId: rest.id },
  );
  const machineProps = withoutReserved(toReactProps(machine), ['onClick', 'onPointerMove', 'onKeyDown']);

  const ours = {
    ...themeAttrs,
    ...machineProps,
    onClick: (event: MouseEvent<HTMLElement>) => {
      machine.onClick(event.nativeEvent);
    },
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      machine.onPointerMove(event.nativeEvent);
      // The other submenus of the parent menu close when the pointer moves to this item.
      parentDispatch({ type: 'ITEM.POINTER_MOVE', key: triggerKey, event: event.nativeEvent });
    },
    onPointerLeave: cancelPending,
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      machine.onKeyDown(event.nativeEvent);
    },
    ref: mergedRef,
  };
  const props = mergeProps(ours, withoutReserved(rest, RESERVED)) as unknown as MenuRenderProps;
  return renderElement<MenuRenderProps, MenuItemState>(render, 'div', props, { open: sub.open, disabled });
}

/**
 * The item of a menu that opens a submenu. It renders a `<div role="menuitem">` with `aria-haspopup="menu"`,
 * `aria-expanded` and `aria-controls`. It is an item of the parent menu: the arrow keys, Home, End and typing
 * reach it like any item. A press on it opens the submenu and never closes the menu.
 *
 * The arrow key that points to the content (Right Arrow, Left Arrow in `rtl`), Enter and Space open the submenu on
 * its first item. A pointer that rests on it opens the submenu after a short wait. A disabled sub-trigger stays in
 * the order of the items and never opens the submenu.
 *
 * @example
 * <Menu.SubTrigger>Share</Menu.SubTrigger>
 * @cckPart subTrigger
 * @param props - The SubTrigger props.
 * @returns The rendered element.
 */
export const MenuSubTrigger: MenuPart<MenuSubTriggerProps> = Object.assign(MenuSubTriggerImpl, {
  displayName: 'Menu.SubTrigger',
});
