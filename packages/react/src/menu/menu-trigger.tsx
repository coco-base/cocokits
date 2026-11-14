'use client';

import { isValidElement, useRef, type KeyboardEvent, type MouseEvent, type ReactElement, type Ref } from 'react';
import { getMenuProps, menuAnatomy } from '@cocokits/machines/menu';
import { toReactProps, useThemeAttrs } from '@cocokits/react-core';
import { nonNativeButtonProps, useElementKind } from '../internal/button-kind';
import { mergeProps, withoutReserved } from '../internal/merge-props';
import { renderElement } from '../internal/render-element';
import { useIsomorphicLayoutEffect } from '../internal/use-isomorphic-layout-effect';
import { useMergedRef } from '../internal/use-merged-ref';
import { useUnnamedWarning } from '../internal/use-unnamed-warning';
import { useMenuContext } from './menu-context';
import type { MenuPart, MenuRenderProps, MenuState, MenuTriggerProps } from './menu.types';

interface ElementProps {
  readonly ref?: Ref<HTMLElement>;
}

/** The attributes that state the open state, and the id the machine renders; a consumer value can never replace them. */
const RESERVED = ['id', 'aria-expanded', 'aria-controls', 'aria-haspopup', 'data-state'];

const UNNAMED_FIX =
  'Put text inside it, or add an aria-label or an aria-labelledby that points to an element with text.';

function MenuTriggerImpl({ render, nativeButton = true, ref, ...rest }: MenuTriggerProps): ReactElement {
  const context = useMenuContext('Menu.Trigger');
  const themeAttrs = useThemeAttrs(menuAnatomy).trigger;
  const { setTriggerId } = context;
  const { trigger } = getMenuProps(
    { id: context.id, open: context.open, mounted: context.mounted, triggerId: rest.id },
    context.dispatch,
  );
  const machineProps = withoutReserved(toReactProps(trigger), [
    'onClick',
    'onKeyDown',
    ...(nativeButton ? [] : ['type']),
  ]);
  const elementRef = isValidElement<ElementProps>(render) ? render.props.ref : undefined;
  const node = useRef<HTMLElement | null>(null);
  const mergedRef = useElementKind(
    'Menu.Trigger',
    nativeButton,
    useMergedRef<HTMLElement>(ref, elementRef, useMergedRef<HTMLElement>(context.setTrigger, node, undefined)),
  );
  // The Content names itself by this id; the server renders it from the same prop.
  useIsomorphicLayoutEffect(() => {
    setTriggerId(rest.id);
    return () => {
      setTriggerId(undefined);
    };
  }, [setTriggerId, rest.id]);
  useUnnamedWarning('Menu', node, { fix: UNNAMED_FIX });

  const ours = {
    ...themeAttrs,
    ...machineProps,
    ...(nativeButton ? {} : nonNativeButtonProps()),
    onClick: (event: MouseEvent<HTMLElement>) => {
      trigger.onClick(event.nativeEvent);
    },
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      trigger.onKeyDown(event.nativeEvent);
    },
    ref: mergedRef,
  };
  const props = mergeProps(ours, withoutReserved(rest, RESERVED)) as unknown as MenuRenderProps;
  return renderElement<MenuRenderProps, MenuState>(render, 'button', props, { open: context.open });
}

/**
 * The button that opens and closes the menu. It renders a `<button type="button">` with `aria-haspopup="menu"` and
 * `aria-expanded`. Native button props pass through, and `ref` reaches the element.
 *
 * Its text is the name of the menu, so give an icon-only trigger an `aria-label`. It has `aria-controls` while the
 * content is mounted.
 *
 * To render another element or component, use `render`. An element that is not a `<button>` also needs
 * `nativeButton={false}`.
 *
 * @example
 * <Menu.Trigger>Actions</Menu.Trigger>
 * @cckPart trigger
 * @param props - The Trigger props.
 * @returns The rendered element.
 */
export const MenuTrigger: MenuPart<MenuTriggerProps> = Object.assign(MenuTriggerImpl, {
  displayName: 'Menu.Trigger',
});
