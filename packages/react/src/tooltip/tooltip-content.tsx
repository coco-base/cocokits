'use client';

import {
  Children,
  isValidElement,
  useContext,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { createDismissLayer, type DismissLayer } from '@cocokits/cdk/dismissal';
import { startOverlayPosition } from '@cocokits/cdk/positioning';
import { getTooltipProps, tooltipAnatomy } from '@cocokits/machines/tooltip';
import { Portal, toReactProps, useDirection, useThemeAttrs } from '@cocokits/react-core';
import { DismissLayerContext } from '../internal/dismiss-layer-context';
import { runDismissHandlers } from '../internal/dismiss-handlers';
import { mergeProps, withoutReserved } from '../internal/merge-props';
import { OverlayArrowContext } from '../internal/overlay-arrow';
import { renderElement } from '../internal/render-element';
import { usePositioningOptions } from '../internal/use-positioning-options';
import { useTriggerWarning } from '../internal/use-trigger-warning';
import { useIsomorphicLayoutEffect } from '../internal/use-isomorphic-layout-effect';
import { useMergedRef } from '../internal/use-merged-ref';
import { useTooltipContext } from './tooltip-context';
import type {
  TooltipAlign,
  TooltipContentProps,
  TooltipContentState,
  TooltipPart,
  TooltipRenderProps,
  TooltipSide,
} from './tooltip.types';

interface ElementProps {
  readonly ref?: Ref<HTMLElement>;
}

/** The attributes the machine owns; `aria-describedby` of the trigger points at `id`. */
const RESERVED = ['id', 'role', 'data-state', 'data-side', 'data-align'];

/** The handlers the machine owns; they are re-created below with the native event. */
const HANDLERS = ['onPointerEnter', 'onPointerLeave'];

function TooltipContentLayer({
  side = 'top',
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
  ...rest
}: TooltipContentProps): ReactElement {
  const context = useTooltipContext('Tooltip.Content');
  const { open, trigger, dispatch, contentRef, setMounted, description } = context;
  const themeAttrs = useThemeAttrs(tooltipAnatomy).content;
  const direction = useDirection();
  const parentLayer = useContext(DismissLayerContext);
  const layerRef = useRef<DismissLayer | null>(null);
  const [placement, setPlacement] = useState<{ side: TooltipSide; align: TooltipAlign } | null>(null);
  const resolved = placement ?? { side, align };
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

  // Read by the layer, which outlives the render that created it.
  const handlers = useRef({ onEscapeKeyDown, onPointerDownOutside });
  useIsomorphicLayoutEffect(() => {
    handlers.current = { onEscapeKeyDown, onPointerDownOutside };
  });

  // The Trigger reads `aria-describedby` from this fact; it is false on the server and before the first commit.
  useIsomorphicLayoutEffect(() => {
    setMounted(true);
    return () => {
      setMounted(false);
    };
  }, [setMounted]);

  // While shown, the tooltip is a layer of the stack, so Escape reaches the topmost one, and a press outside closes
  // it. Focus leaving is not its concern: the blur closes it. An exit animation takes no part.
  useIsomorphicLayoutEffect(() => {
    const content = contentRef.current;
    if (!open || !content || !trigger) return undefined;
    const layer = createDismissLayer({
      getInsideElements: () => [trigger, contentRef.current],
      onDismiss: (intent) => {
        runDismissHandlers(intent, handlers.current);
        if (intent.defaultPrevented) return;
        const { reason, event } = intent;
        // `onOpenChange` can refuse too, with `details.cancel()`: the layers below then stay open as well.
        if (reason !== 'focus-out' && !dispatch({ type: 'CONTENT.DISMISS', reason, event })) intent.preventDefault();
      },
      getParent: () => parentLayer?.current ?? null,
    });
    layerRef.current = layer;
    return () => {
      layer.destroy();
      layerRef.current = null;
    };
  }, [open, trigger, dispatch, parentLayer, contentRef]);

  useIsomorphicLayoutEffect(() => {
    if (!open || !trigger || !contentRef.current) return undefined;
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

  const { content } = getTooltipProps(
    {
      id: context.id,
      open,
      mounted: true,
      description,
      side: resolved.side,
      align: resolved.align,
      keptClosed: forceMount && !context.keepMounted,
    },
    dispatch,
  );
  const ours = {
    ...themeAttrs,
    ...withoutReserved(toReactProps(content), HANDLERS),
    ...(anchorHidden ? { hidden: true } : {}),
    onPointerEnter: (event: PointerEvent<HTMLElement>) => {
      content.onPointerEnter(event.nativeEvent);
    },
    onPointerLeave: (event: PointerEvent<HTMLElement>) => {
      content.onPointerLeave(event.nativeEvent);
    },
    ref: mergedRef,
    children,
  };
  const props = mergeProps(ours, withoutReserved(rest, RESERVED)) as unknown as TooltipRenderProps;
  const state: TooltipContentState = { open, side: resolved.side, align: resolved.align };

  return (
    <DismissLayerContext.Provider value={layerRef}>
      <OverlayArrowContext.Provider value={arrowContext}>
        {renderElement<TooltipRenderProps, TooltipContentState>(render, 'div', props, state)}
      </OverlayArrowContext.Provider>
    </DismissLayerContext.Provider>
  );
}

/** The text of children that are text only (strings and numbers), else `null`. */
function textOf(children: ReactNode): string | null {
  const items = Children.toArray(children);
  if (items.length === 0 || !items.every((item) => typeof item === 'string' || typeof item === 'number')) return null;
  return items.join('');
}

function TooltipContentImpl({ 'aria-label': ariaLabel, ...props }: TooltipContentProps): ReactElement {
  const { keepMounted, trigger, setDescriptionText } = useTooltipContext('Tooltip.Content');
  useTriggerWarning('Tooltip.Content', trigger);
  // The description outlives the content: this part renders while the tooltip is closed, its layer does not.
  const text = ariaLabel ?? textOf(props.children);
  useIsomorphicLayoutEffect(() => {
    setDescriptionText(text);
    return () => {
      setDescriptionText(null);
    };
  }, [text, setDescriptionText]);
  return (
    <Portal open={(keepMounted || props.forceMount === true) && trigger !== null} getTrigger={() => trigger}>
      <TooltipContentLayer {...props} />
    </Portal>
  );
}

/**
 * The text of the tooltip. It renders a `<div role="tooltip">` in the overlay container, not next to the trigger.
 * It never takes the focus, so keep links and buttons out of it.
 *
 * It renders nothing while hidden, on the server and in the first client render. With `forceMount`, the closed
 * content stays in the document.
 *
 * It opens on `side` and `align` of the trigger. It flips and shifts to stay in view, and says where it is with
 * `data-side` and `data-align`. The other positioning props fine-tune where it sits.
 *
 * It stays open while the pointer is over it, unless the Root has `disableHoverableContent`. Put a `Tooltip.Arrow`
 * inside it for a pointer to the trigger.
 *
 * Text children, or `aria-label`, also describe the trigger. After hydration, a hidden copy of that text stays
 * while the tooltip is closed. Screen readers then skip the visible content.
 *
 * It hides on Escape and on a press outside. To refuse one, call `event.preventDefault()` in `onEscapeKeyDown` or
 * `onPointerDownOutside`. WCAG 1.4.13 asks that the user can hide a tooltip, so keep another way to hide it.
 *
 * @example
 * <Tooltip.Content side="bottom">
 *   Copy link
 *   <Tooltip.Arrow />
 * </Tooltip.Content>
 * @cckPart content
 * @param props - The Content props.
 * @returns The portal, or nothing while hidden.
 */
export const TooltipContent: TooltipPart<TooltipContentProps> = Object.assign(TooltipContentImpl, {
  displayName: 'Tooltip.Content',
});
