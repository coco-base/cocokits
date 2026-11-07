'use client';

import { isValidElement, useContext, useEffect, useMemo, useRef, useState, type ReactElement, type Ref } from 'react';
import { createDismissLayer, type DismissLayer } from '@cocokits/cdk/dismissal';
import {
  captureFocusReturn,
  connectFocusGuards,
  focusFirst,
  makeOutsideInert,
  scheduleFocus,
} from '@cocokits/cdk/focus';
import { startOverlayPosition } from '@cocokits/cdk/positioning';
import { lockScroll } from '@cocokits/cdk/scroll-lock';
import { getPopoverProps, popoverAnatomy } from '@cocokits/machines/popover';
import { Portal, toReactProps, useDirection, useThemeAttrs } from '@cocokits/react-core';
import { hasAccessibleName, visuallyHiddenStyle } from '@cocokits/utils';
import { isDevelopment } from '../internal/dev';
import { allowsAutoFocus, runDismissHandlers } from '../internal/dismiss-handlers';
import { DismissLayerContext } from '../internal/dismiss-layer-context';
import { mergeProps, withoutReserved } from '../internal/merge-props';
import { OverlayArrowContext } from '../internal/overlay-arrow';
import { renderElement } from '../internal/render-element';
import { usePositioningOptions } from '../internal/use-positioning-options';
import { useTriggerWarning } from '../internal/use-trigger-warning';
import { useIsomorphicLayoutEffect } from '../internal/use-isomorphic-layout-effect';
import { useMergedRef } from '../internal/use-merged-ref';
import { useModalAtOpen } from '../internal/use-modal-at-open';
import { usePopoverContext } from './popover-context';
import type {
  PopoverAlign,
  PopoverContentProps,
  PopoverContentState,
  PopoverPart,
  PopoverRenderProps,
  PopoverSide,
} from './popover.types';

interface ElementProps {
  readonly ref?: Ref<HTMLElement>;
}

/** The attributes the machine owns; `aria-controls` of the trigger points at `id`. */
const RESERVED = ['id', 'role', 'data-state', 'data-side', 'data-align'];

function PopoverContentLayer({
  side = 'bottom',
  align = 'center',
  sideOffset,
  alignOffset,
  avoidCollisions,
  collisionPadding,
  sticky,
  hideWhenDetached,
  collisionBoundary,
  updatePositionStrategy,
  arrowPadding,
  forceMount = false,
  render,
  ref,
  children,
  onEscapeKeyDown,
  onPointerDownOutside,
  onFocusOutside,
  onInteractOutside,
  onOpenAutoFocus,
  onCloseAutoFocus,
  ...rest
}: PopoverContentProps): ReactElement {
  const context = usePopoverContext('Popover.Content');
  const { open, trigger, dispatch, contentRef, setMounted } = context;
  const modal = useModalAtOpen(open, context.modal);
  const themeAttrs = useThemeAttrs(popoverAnatomy).content;
  const direction = useDirection();
  const parentLayer = useContext(DismissLayerContext);
  const layerRef = useRef<DismissLayer | null>(null);
  const startGuard = useRef<HTMLSpanElement | null>(null);
  const endGuard = useRef<HTMLSpanElement | null>(null);
  const [placement, setPlacement] = useState<{ side: PopoverSide; align: PopoverAlign } | null>(null);
  const resolved = placement ?? { side, align };
  const { anchor } = context;
  const [arrow, setArrow] = useState<HTMLElement | null>(null);
  const {
    options: positioning,
    anchorHidden,
    arrowHidden,
  } = usePositioningOptions(
    {
      sideOffset,
      alignOffset,
      avoidCollisions,
      collisionPadding,
      sticky,
      hideWhenDetached,
      collisionBoundary,
      updatePositionStrategy,
      arrowPadding,
    },
    arrow,
  );
  const arrowContext = useMemo(() => ({ setElement: setArrow, hidden: arrowHidden }), [arrowHidden]);

  const elementRef = isValidElement<ElementProps>(render) ? render.props.ref : undefined;
  const mergedRef = useMergedRef<HTMLElement>(ref, elementRef, contentRef);

  // Read by the layer and the focus hooks, which outlive the render that created them.
  const handlers = useRef({
    onEscapeKeyDown,
    onPointerDownOutside,
    onFocusOutside,
    onInteractOutside,
    onOpenAutoFocus,
    onCloseAutoFocus,
  });
  const openNow = useRef(open);
  useIsomorphicLayoutEffect(() => {
    openNow.current = open;
    handlers.current = {
      onEscapeKeyDown,
      onPointerDownOutside,
      onFocusOutside,
      onInteractOutside,
      onOpenAutoFocus,
      onCloseAutoFocus,
    };
  });

  // The Trigger reads `aria-controls` from this fact; it is false on the server and before the first commit.
  useIsomorphicLayoutEffect(() => {
    setMounted(true);
    return () => {
      setMounted(false);
    };
  }, [setMounted]);

  // The layer, the focus and the guards live while the popover is open; an exit animation after that takes no
  // part in dismissal or focus. They start in a layout effect, not in a ref callback: the content stays mounted
  // when `open` flips, so a ref callback would have to change identity and detach the author's `ref`.
  useIsomorphicLayoutEffect(() => {
    const content = contentRef.current;
    if (!open || !content || !trigger) return undefined;
    const doc = content.ownerDocument;
    const focusReturn = captureFocusReturn({ getTrigger: () => trigger, getContent: () => contentRef.current });
    // The guards listen first: a focus on a guard closes the popover (it is outside), and the close removes the guard in
    // the same event, so a listener that ran after the layer's would find no guard to forward the focus from.
    const guards = connectFocusGuards({
      getContent: () => contentRef.current,
      getTrigger: () => trigger,
      getGuards: () => [startGuard.current, endGuard.current],
      loop: modal,
    });
    const layer = createDismissLayer({
      // A looping modal moves focus from a guard itself, so the guards lie inside.
      getInsideElements: () => [trigger, contentRef.current, ...(modal ? [startGuard.current, endGuard.current] : [])],
      onDismiss: (intent) => {
        runDismissHandlers(intent, handlers.current);
        if (intent.defaultPrevented) return;
        const { reason, event } = intent;
        // `onOpenChange` can refuse too, with `details.cancel()`: the layers below then stay open as well.
        if (!dispatch({ type: 'CONTENT.DISMISS', reason, event })) intent.preventDefault();
      },
      dismissOn: ['escape', 'outside-press', 'focus-out'],
      getParent: () => parentLayer?.current ?? null,
      modal,
    });
    layerRef.current = layer;
    // Everything outside the content is inert (the guards are inside), and the page does not scroll, until the popover
    // closes. Overlays opened from the content later are not inert: attributes are set on existing nodes only.
    const releaseInert = modal
      ? makeOutsideInert(() => [contentRef.current, startGuard.current, endGuard.current])
      : undefined;
    const unlockScroll = modal ? lockScroll(doc) : undefined;
    const cancelFocus = scheduleFocus(doc, () => {
      if (contentRef.current && allowsAutoFocus('focus-open', handlers.current.onOpenAutoFocus)) {
        focusFirst(contentRef.current);
      }
    });
    return () => {
      cancelFocus();
      guards.destroy();
      layer.destroy();
      layerRef.current = null;
      // Before focus returns: the trigger is outside the inert set, so it must be usable again.
      releaseInert?.();
      unlockScroll?.();
      // After the click that closed it has moved focus, so a press on another control keeps it there.
      scheduleFocus(doc, () => {
        // Not when it opened again meanwhile (StrictMode runs this cleanup on a mounted popover).
        if (openNow.current) return;
        if (allowsAutoFocus('focus-close', handlers.current.onCloseAutoFocus)) focusReturn.restore();
      });
    };
  }, [open, trigger, dispatch, parentLayer, contentRef, modal]);

  useIsomorphicLayoutEffect(() => {
    if (!open || !trigger || !contentRef.current) return undefined;
    // Nothing is passed for an unset option, so the positioning defaults apply. An Anchor replaces the trigger,
    // also while its virtual reference is empty (the content is then not placed).
    return startOverlayPosition({
      getAnchor: anchor ?? (() => trigger),
      getContent: () => contentRef.current,
      side,
      align,
      getDirection: () => direction,
      onPlacementChange: setPlacement,
      ...positioning,
    });
  }, [open, trigger, anchor, side, align, positioning, direction, contentRef]);

  useEffect(() => {
    if (!isDevelopment()) return undefined;
    // After the author's `aria-labelledby` target has rendered.
    const frame = requestAnimationFrame(() => {
      if (contentRef.current && !hasAccessibleName(contentRef.current)) {
        console.warn(
          'CocoKits: <Popover.Content> has no accessible name. Add a <Popover.Title>, or an aria-label or aria-labelledby.',
        );
      }
    });
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [contentRef]);

  const { content } = getPopoverProps(
    {
      id: context.id,
      open,
      mounted: true,
      side: resolved.side,
      align: resolved.align,
      hasTitle: context.hasTitle,
      hasDescription: context.hasDescription,
      anchorHidden,
      modal,
      keptClosed: forceMount && !context.keepMounted,
    },
    dispatch,
  );
  const ours = { ...themeAttrs, ...toReactProps(content), ref: mergedRef, children };
  const props = mergeProps(ours, withoutReserved(rest, RESERVED)) as unknown as PopoverRenderProps;
  const state: PopoverContentState = { open, side: resolved.side, align: resolved.align };

  return (
    <DismissLayerContext.Provider value={layerRef}>
      <OverlayArrowContext.Provider value={arrowContext}>
        {context.keepMounted && <span ref={startGuard} tabIndex={0} style={visuallyHiddenStyle} />}
        {renderElement<PopoverRenderProps, PopoverContentState>(render, 'div', props, state)}
        {context.keepMounted && <span ref={endGuard} tabIndex={0} style={visuallyHiddenStyle} />}
      </OverlayArrowContext.Provider>
    </DismissLayerContext.Provider>
  );
}

function PopoverContentImpl(props: PopoverContentProps): ReactElement {
  const { keepMounted, trigger } = usePopoverContext('Popover.Content');
  useTriggerWarning('Popover.Content', trigger);
  return (
    <Portal open={(keepMounted || props.forceMount === true) && trigger !== null} getTrigger={() => trigger}>
      <PopoverContentLayer {...props} />
    </Portal>
  );
}

/**
 * The panel of the popover. It renders a `<div role="dialog">` in the overlay container, not next to the trigger. A
 * `Popover.Title` names it and a `Popover.Description` describes it; without a Title, give it an `aria-label`.
 *
 * It renders nothing while closed, on the server and in the first client render. So a popover that starts open
 * appears right after hydration. With `forceMount`, the closed content stays in the document.
 *
 * It opens on `side` and `align` of the trigger, or of the `Popover.Anchor`. It flips and shifts to stay in view,
 * and says where it is with `data-side` and `data-align`.
 *
 * On open, the focus moves to its first control, or to the content when it has none. On Escape, a Close or a
 * press on empty space, the focus returns to the trigger.
 *
 * A press on another control keeps the focus there. Tab after the last control moves to the element after the
 * trigger and closes the popover.
 *
 * With `modal` on the Root, the page outside is inert, the page does not scroll, Tab stays inside and the content
 * has `aria-modal="true"`.
 *
 * To refuse a close, call `event.preventDefault()` in `onEscapeKeyDown`, `onPointerDownOutside`, `onFocusOutside`
 * or `onInteractOutside`. Stop the focus moves with `onOpenAutoFocus` and `onCloseAutoFocus`.
 *
 * @example
 * <Popover.Content side="top">
 *   <Popover.Title>Share this page</Popover.Title>
 *   <Popover.Close>Done</Popover.Close>
 * </Popover.Content>
 * @cckPart content
 * @param props - The Content props.
 * @returns The portal, or nothing while closed.
 */
export const PopoverContent: PopoverPart<PopoverContentProps> = Object.assign(PopoverContentImpl, {
  displayName: 'Popover.Content',
});
