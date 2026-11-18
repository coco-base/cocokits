'use client';

import {
  isValidElement,
  useCallback,
  useId,
  useMemo,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactElement,
  type Ref,
} from 'react';
import {
  getMenuItemChange,
  getMenuProps,
  menuAnatomy,
  type MenuEvent,
  type MenuItemChange,
  type MenuItemEntry,
} from '@cocokits/machines/menu';
import { toReactProps, useDirection, useThemeAttrs } from '@cocokits/react-core';
import { mergeProps, withoutReserved } from '../internal/merge-props';
import { renderElement, type RenderProp } from '../internal/render-element';
import { useMergedRef } from '../internal/use-merged-ref';
import { useMenuContext } from './menu-context';
import { MenuItemContext, type MenuItemContextValue } from './menu-part-contexts';
import type { MenuCheckableItemState } from './menu-parts.types';
import type { MenuRenderProps } from './menu.types';

interface ElementProps {
  readonly ref?: Ref<HTMLElement>;
}

/** The attributes that state the item; a consumer value can never replace them. */
const RESERVED = ['role', 'tabIndex', 'aria-disabled', 'aria-checked', 'data-disabled', 'data-state'];

/** What differs between a plain item, a checkbox item and a radio item. */
export interface MenuItemBehavior {
  /** What the item is. */
  readonly kind: 'item' | 'checkbox' | 'radio';
  /** Whether a checkbox or radio item is checked. */
  readonly checked: boolean;
  /** The value a radio item sets in its group. */
  readonly value?: string | undefined;
  /** Whether the item is disabled. */
  readonly disabled: boolean;
  /** The author's `onSelect`: it runs once when the item runs and can keep the menu open. */
  readonly onSelect?: ((event: Event) => void) | undefined;
  /** Applies what a press on a checkbox or radio item asks for. */
  readonly onChange?: ((change: MenuItemChange, event: Event) => void) | undefined;
}

/** What the part gives the hook besides the behaviour. */
export interface MenuItemElement {
  /** The part name, for the error of a part outside a menu. */
  readonly part: string;
  /** The author's `render`. */
  readonly render: RenderProp<MenuRenderProps, MenuCheckableItemState> | undefined;
  /** The author's `ref`. */
  readonly ref: Ref<HTMLElement> | undefined;
  /** The rest of the author's props. */
  readonly rest: Readonly<Record<string, unknown>>;
}

/**
 * The behaviour and the element of an item of a menu: the plain item, the checkbox item and the radio item. It
 * registers the item with the menu, builds the machine props, runs the press (the change of a checkable item
 * first, then `onSelect`, then the close) and renders the element with the item context around it. Internal.
 *
 * @param behavior - What differs between the items.
 * @param element - The part name and the author's `render`, `ref` and props.
 * @returns The rendered item inside its context.
 */
export function useMenuItem(behavior: MenuItemBehavior, element: MenuItemElement): ReactElement {
  const { kind, checked, value, disabled, onSelect, onChange } = behavior;
  const context = useMenuContext(element.part);
  const key = useId();
  const dir = useDirection();
  const themeAttrs =
    useThemeAttrs(menuAnatomy)[kind === 'checkbox' ? 'checkboxItem' : kind === 'radio' ? 'radioItem' : 'item'];
  const [descriptions, setDescriptions] = useState(0);
  const registerDescription = useCallback((): (() => void) => {
    setDescriptions((count) => count + 1);
    return () => {
      setDescriptions((count) => count - 1);
    };
  }, []);
  const { registerItem, dispatch } = context;
  const register = useCallback((node: HTMLElement) => registerItem(key, node), [registerItem, key]);
  const elementRef = isValidElement<ElementProps>(element.render) ? element.render.props.ref : undefined;
  const mergedRef = useMergedRef<HTMLElement>(element.ref, elementRef, register);

  const entry: MenuItemEntry = {
    key,
    text: '',
    disabled,
    kind,
    checked,
    value,
    hasDescription: descriptions > 0,
  };
  // A press on a checkable item changes its state first. Running the item then fires `onSelect`; a handler that
  // prevents it keeps the menu open. Space only changes the state.
  const send = (event: MenuEvent): void => {
    if (event.type === 'ITEM.CHECK' || (event.type === 'ITEM.RUN' && !event.disabled)) {
      const change = getMenuItemChange(entry);
      if (change) onChange?.(change, event.event);
    }
    if (event.type !== 'ITEM.RUN' || event.disabled) {
      dispatch(event);
      return;
    }
    const selectEvent = new Event('select', { cancelable: true });
    onSelect?.(selectEvent);
    dispatch({ ...event, prevented: selectEvent.defaultPrevented });
  };
  const entries = useMemo(() => context.keys.map((entryKey) => ({ key: entryKey, text: '' })), [context.keys]);
  const { item } = getMenuProps(
    {
      id: context.id,
      open: context.open,
      items: entries,
      activeKey: context.activeKey,
      typeahead: context.typeahead,
      dir,
    },
    send,
  );
  const machine = item(entry);
  const machineProps = withoutReserved(toReactProps(machine), ['onClick', 'onKeyDown', 'onPointerMove']);

  const ours = {
    ...themeAttrs,
    ...machineProps,
    onClick: (event: MouseEvent<HTMLElement>) => {
      machine.onClick(event.nativeEvent);
    },
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      machine.onKeyDown(event.nativeEvent);
    },
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      machine.onPointerMove(event.nativeEvent);
    },
    ref: mergedRef,
  };
  const props = mergeProps(ours, withoutReserved(element.rest, RESERVED)) as unknown as MenuRenderProps;
  const state: MenuCheckableItemState = { open: context.open, disabled, checked };
  const itemContext = useMemo<MenuItemContextValue>(
    () => ({ key, checked, registerDescription }),
    [key, checked, registerDescription],
  );
  return (
    <MenuItemContext.Provider value={itemContext}>
      {renderElement<MenuRenderProps, MenuCheckableItemState>(element.render, 'div', props, state)}
    </MenuItemContext.Provider>
  );
}
