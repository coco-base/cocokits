'use client';

import {
  isValidElement,
  useCallback,
  useId,
  useMemo,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type Ref,
} from 'react';
import { getMenuProps, menuAnatomy, type MenuEvent } from '@cocokits/machines/menu';
import { toReactProps, useThemeAttrs } from '@cocokits/react-core';
import { mergeProps, withoutReserved } from '../internal/merge-props';
import { renderElement } from '../internal/render-element';
import { useMergedRef } from '../internal/use-merged-ref';
import { useMenuContext } from './menu-context';
import type { MenuItemProps, MenuItemState, MenuPart, MenuRenderProps } from './menu.types';

interface ElementProps {
  readonly ref?: Ref<HTMLElement>;
}

/** The attributes that state the item; a consumer value can never replace them. */
const RESERVED = ['role', 'tabIndex', 'aria-disabled', 'data-disabled'];

function MenuItemImpl({ disabled = false, onSelect, render, ref, ...rest }: MenuItemProps): ReactElement {
  const context = useMenuContext('Menu.Item');
  const key = useId();
  const themeAttrs = useThemeAttrs(menuAnatomy).item;
  const { registerItem, dispatch } = context;
  const register = useCallback((element: HTMLElement) => registerItem(key, element), [registerItem, key]);
  const elementRef = isValidElement<ElementProps>(render) ? render.props.ref : undefined;
  const mergedRef = useMergedRef<HTMLElement>(ref, elementRef, register);

  // Running fires the item event first; a handler that prevents it keeps the menu open.
  const send = (event: MenuEvent): void => {
    if (event.type !== 'ITEM.RUN' || event.disabled) {
      dispatch(event);
      return;
    }
    const selectEvent = new Event('select', { cancelable: true });
    onSelect?.(selectEvent);
    dispatch({ ...event, prevented: selectEvent.defaultPrevented });
  };
  const entries = useMemo(() => context.keys.map((entry) => ({ key: entry, text: '' })), [context.keys]);
  const { item } = getMenuProps(
    { id: context.id, open: context.open, items: entries, activeKey: context.activeKey, typeahead: context.typeahead },
    send,
  );
  const machineProps = withoutReserved(toReactProps(item({ key, text: '', disabled })), ['onClick', 'onKeyDown']);

  const ours = {
    ...themeAttrs,
    ...machineProps,
    onClick: (event: MouseEvent<HTMLElement>) => {
      item({ key, text: '', disabled }).onClick(event.nativeEvent);
    },
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      item({ key, text: '', disabled }).onKeyDown(event.nativeEvent);
    },
    ref: mergedRef,
  };
  const props = mergeProps(ours, withoutReserved(rest, RESERVED)) as unknown as MenuRenderProps;
  return renderElement<MenuRenderProps, MenuItemState>(render, 'div', props, { open: context.open, disabled });
}

/**
 * One action of the menu. It renders a `<div role="menuitem">`. Native `div` props pass through, and `ref` reaches
 * the element.
 *
 * Only one item is a tab stop: the one that has the focus, or had it last. Arrow keys, Home, End and typing move
 * the focus between items. A disabled item stays in that order and runs nothing.
 *
 * To render a link, use `render`. Enter and Space click the item, so the link is followed.
 *
 * @example
 * <Menu.Item onSelect={() => remove()}>Delete</Menu.Item>
 * @example
 * <Menu.Item render={<a href="/settings" />}>Settings</Menu.Item>
 * @cckPart item
 * @param props - The Item props.
 * @returns The rendered element.
 */
export const MenuItem: MenuPart<MenuItemProps> = Object.assign(MenuItemImpl, {
  displayName: 'Menu.Item',
});
