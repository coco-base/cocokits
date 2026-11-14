'use client';

import { isValidElement, useContext, useRef, useState, type KeyboardEvent, type ReactElement, type Ref } from 'react';
import { createDismissLayer, type DismissLayer } from '@cocokits/cdk/dismissal';
import { captureFocusReturn, connectFocusGuards, scheduleFocus } from '@cocokits/cdk/focus';
import { startOverlayPosition } from '@cocokits/cdk/positioning';
import { getMenuProps, menuAnatomy, type MenuAlign, type MenuSide } from '@cocokits/machines/menu';
import { Portal, toReactProps, useDirection, useThemeAttrs } from '@cocokits/react-core';
import { visuallyHiddenStyle } from '@cocokits/utils';
import { runDismissHandlers } from '../internal/dismiss-handlers';
import { DismissLayerContext } from '../internal/dismiss-layer-context';
import { mergeProps, withoutReserved } from '../internal/merge-props';
import { renderElement } from '../internal/render-element';
import { useIsomorphicLayoutEffect } from '../internal/use-isomorphic-layout-effect';
import { useMergedRef } from '../internal/use-merged-ref';
import { usePositioningOptions } from '../internal/use-positioning-options';
import { useTriggerWarning } from '../internal/use-trigger-warning';
import { useMenuContext } from './menu-context';
import type { MenuContentProps, MenuContentState, MenuPart, MenuRenderProps } from './menu.types';

interface ElementProps {
  readonly ref?: Ref<HTMLElement>;
}

/** The attributes the machine owns; `aria-controls` of the trigger points at `id`. */
const RESERVED = ['id', 'role', 'data-state', 'data-side', 'data-align'];

function MenuContentLayer({
  side = 'bottom',
  align = 'start',
  sideOffset,
  alignOffset,
  render,
  ref,
  children,
  onEscapeKeyDown,
  onPointerDownOutside,
  onFocusOutside,
  onInteractOutside,
  ...rest
}: MenuContentProps): ReactElement {
  const context = useMenuContext('Menu.Content');
  const { open, trigger, dispatch, contentRef, setMounted, typeahead, getEntries, getItem, takeInitialFocus } = context;
  const themeAttrs = useThemeAttrs(menuAnatomy).content;
  const direction = useDirection();
  const parentLayer = useContext(DismissLayerContext);
  const layerRef = useRef<DismissLayer | null>(null);
  const startGuard = useRef<HTMLSpanElement | null>(null);
  const endGuard = useRef<HTMLSpanElement | null>(null);
  const [placement, setPlacement] = useState<{ side: MenuSide; align: MenuAlign } | null>(null);
  const resolved = placement ?? { side, align };
  const { options: positioning } = usePositioningOptions({ sideOffset, alignOffset });

  const elementRef = isValidElement<ElementProps>(render) ? render.props.ref : undefined;
  const mergedRef = useMergedRef<HTMLElement>(ref, elementRef, contentRef);

  // Read by the layer and the focus hooks, which outlive the render that created them.
  const handlers = useRef({ onEscapeKeyDown, onPointerDownOutside, onFocusOutside, onInteractOutside });
  const openNow = useRef(open);
  useIsomorphicLayoutEffect(() => {
    openNow.current = open;
    handlers.current = { onEscapeKeyDown, onPointerDownOutside, onFocusOutside, onInteractOutside };
  });

  // The Trigger reads `aria-controls` from this fact; it is false on the server and before the first commit.
  useIsomorphicLayoutEffect(() => {
    setMounted(true);
    return () => {
      setMounted(false);
    };
  }, [setMounted]);

  // The layer, the focus and the guards live while the menu is open; an exit animation after that takes no part
  // in dismissal or focus. They start in a layout effect, not in a ref callback: the content stays mounted when
  // `open` flips, so a ref callback would have to change identity and detach the author's `ref`.
  useIsomorphicLayoutEffect(() => {
    const content = contentRef.current;
    if (!open || !content || !trigger) return undefined;
    const doc = content.ownerDocument;
    const focusReturn = captureFocusReturn({ getTrigger: () => trigger, getContent: () => contentRef.current });
    // The guards listen first: a focus on a guard closes the menu (it is outside), and the close removes the guard in
    // the same event, so a listener that ran after the layer's would find no guard to forward the focus from.
    const guards = connectFocusGuards({
      getContent: () => contentRef.current,
      getTrigger: () => trigger,
      getGuards: () => [startGuard.current, endGuard.current],
      loop: false,
    });
    const layer = createDismissLayer({
      getInsideElements: () => [trigger, contentRef.current],
      onDismiss: (intent) => {
        runDismissHandlers(intent, handlers.current);
        if (intent.defaultPrevented) return;
        const { reason, event } = intent;
        // `onOpenChange` can refuse too, with `details.cancel()`: the layers below then stay open as well.
        if (!dispatch({ type: 'CONTENT.DISMISS', reason, event })) intent.preventDefault();
      },
      dismissOn: ['escape', 'outside-press', 'focus-out'],
      getParent: () => parentLayer?.current ?? null,
      modal: false,
    });
    layerRef.current = layer;
    // Focus goes to the first or the last item, or to the content when it holds none.
    const cancelFocus = scheduleFocus(doc, () => {
      const entries = getEntries();
      const target = takeInitialFocus() === 'last' ? entries.at(-1) : entries[0];
      (target ? getItem(target.key) : contentRef.current)?.focus();
    });
    return () => {
      cancelFocus();
      typeahead.reset();
      guards.destroy();
      layer.destroy();
      layerRef.current = null;
      // After the click that closed it has moved focus, so a press on another control keeps it there.
      scheduleFocus(doc, () => {
        // Not when it opened again meanwhile (StrictMode runs this cleanup on a mounted menu).
        if (openNow.current) return;
        focusReturn.restore();
      });
    };
  }, [open, trigger, dispatch, parentLayer, contentRef, typeahead, getEntries, getItem, takeInitialFocus]);

  useIsomorphicLayoutEffect(() => {
    if (!open || !trigger || !contentRef.current) return undefined;
    // Nothing is passed for an unset option, so the positioning defaults apply.
    return startOverlayPosition({
      getAnchor: () => trigger,
      getContent: () => contentRef.current,
      side,
      align,
      getDirection: () => direction,
      onPlacementChange: setPlacement,
      ...positioning,
    });
  }, [open, trigger, side, align, positioning, direction, contentRef]);

  const named = rest['aria-label'] !== undefined || rest['aria-labelledby'] !== undefined;
  const { content } = getMenuProps(
    {
      id: context.id,
      open,
      mounted: true,
      side: resolved.side,
      align: resolved.align,
      named,
    },
    dispatch,
  );
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>): void => {
    // A key from a layer opened inside an item reaches this handler through the React tree; it is not ours.
    if (!event.currentTarget.contains(event.target as Node)) return;
    getMenuProps(
      { id: context.id, open, items: getEntries(), activeKey: context.activeKey, named, typeahead },
      dispatch,
    ).content.onKeyDown(event.nativeEvent);
  };
  const ours = {
    ...themeAttrs,
    ...withoutReserved(toReactProps(content), ['onKeyDown']),
    onKeyDown: handleKeyDown,
    ref: mergedRef,
    children,
  };
  const props = mergeProps(ours, withoutReserved(rest, RESERVED)) as unknown as MenuRenderProps;
  const state: MenuContentState = { open, side: resolved.side, align: resolved.align };

  return (
    <DismissLayerContext.Provider value={layerRef}>
      {context.keepMounted && <span ref={startGuard} tabIndex={0} style={visuallyHiddenStyle} />}
      {renderElement<MenuRenderProps, MenuContentState>(render, 'div', props, state)}
      {context.keepMounted && <span ref={endGuard} tabIndex={0} style={visuallyHiddenStyle} />}
    </DismissLayerContext.Provider>
  );
}

function MenuContentImpl(props: MenuContentProps): ReactElement {
  const { keepMounted, trigger } = useMenuContext('Menu.Content');
  useTriggerWarning('Menu.Content', trigger);
  return (
    <Portal open={keepMounted && trigger !== null} getTrigger={() => trigger}>
      <MenuContentLayer {...props} />
    </Portal>
  );
}

/**
 * The panel of the menu. It renders a `<div role="menu">` in the overlay container, not next to the trigger. The
 * trigger names it; give the content an `aria-label` or an `aria-labelledby` to use another name.
 *
 * It renders nothing while closed, on the server and in the first client render. So a menu that starts open
 * appears right after hydration.
 *
 * It opens on `side` and `align` of the trigger. It flips and shifts to stay in view, and says where it is with
 * `data-side` and `data-align`.
 *
 * On open, the focus moves to the first item, or to the last when ArrowUp opened the menu. A menu with no item
 * takes the focus itself. On Escape, a run item or a press on empty space, the focus returns to the trigger.
 *
 * A press on another control keeps the focus there. Tab moves to the element after the trigger and closes the
 * menu. To refuse a close, call `event.preventDefault()` in `onEscapeKeyDown`, `onPointerDownOutside`,
 * `onFocusOutside` or `onInteractOutside`.
 *
 * @example
 * <Menu.Content side="top" align="end">
 *   <Menu.Item>Edit</Menu.Item>
 *   <Menu.Item>Duplicate</Menu.Item>
 * </Menu.Content>
 * @cckPart content
 * @param props - The Content props.
 * @returns The portal, or nothing while closed.
 */
export const MenuContent: MenuPart<MenuContentProps> = Object.assign(MenuContentImpl, {
  displayName: 'Menu.Content',
});
