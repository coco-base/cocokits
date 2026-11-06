'use client';

import { useContext, useRef, useState, type ReactElement } from 'react';
import { createTriggerDismissLayer, type DismissLayer } from '@cocokits/cdk/dismissal';
import { startOverlayPosition, type OverlayAlign, type OverlaySide } from '@cocokits/cdk/positioning';
import { Portal, toReactProps, useDirection } from '@cocokits/react-core';
import { runDismissHandlers } from '../internal/dismiss-handlers';
import { DismissLayerContext } from '../internal/dismiss-layer-context';
import { renderElement } from '../internal/render-element';
import { usePositioningOptions } from '../internal/use-positioning-options';
import { useIsomorphicLayoutEffect } from '../internal/use-isomorphic-layout-effect';
import { useSelectContext, type SelectContextValue } from './select-context';
import type { SelectPart, SelectRenderProps } from './select.types';
import type { SelectContentProps } from './select-parts.types';
import { useSelectPartProps } from './use-select-part';

/** The attributes the machine owns; a consumer value can never replace them. */
const RESERVED = [
  'id',
  'role',
  'aria-multiselectable',
  'aria-labelledby',
  'aria-label',
  'data-state',
  'data-multiple',
  'data-side',
  'data-align',
];

/**
 * Starts the dismiss layer of the open list: Escape and a press outside reach the Content handlers and then the
 * Select, inside the layer walk, so a refusal keeps the layers below open.
 */
function useSelectDismissLayer(
  context: SelectContextValue,
  layerRef: { current: DismissLayer | null },
  parentLayer: { current: DismissLayer | null } | null,
): void {
  const { open, trigger, anchor, contentRef, dispatch, holdFocusOut, layerActiveRef, contentHandlersRef } = context;
  useIsomorphicLayoutEffect(() => {
    const content = contentRef.current;
    if (!open || !trigger || !content) return undefined;
    const { layer, stop } = createTriggerDismissLayer({
      trigger: () => trigger,
      inside: () => [trigger, anchor, contentRef.current],
      parent: () => parentLayer?.current ?? null,
      // `onOpenChange` can refuse too, with `details.cancel()`: the layers below then stay open as well.
      escape: (intent) => {
        runDismissHandlers(intent, contentHandlersRef.current);
        return !intent.defaultPrevented && dispatch({ type: 'LIST.DISMISS', reason: 'escape', event: intent.event });
      },
      press: (intent, focusLeft) => {
        runDismissHandlers(intent, contentHandlersRef.current);
        return (
          !intent.defaultPrevented &&
          dispatch({ type: 'LIST.DISMISS', reason: 'outside-press', event: intent.event, focusLeft })
        );
      },
      holdFocusOut,
    });
    layerRef.current = layer;
    layerActiveRef.current = true;
    return () => {
      stop();
      layerRef.current = null;
      layerActiveRef.current = false;
    };
    // The layer follows the open state and the elements; the handlers are read live from the ref.
  }, [
    open,
    trigger,
    anchor,
    dispatch,
    parentLayer,
    contentRef,
    holdFocusOut,
    layerActiveRef,
    contentHandlersRef,
    layerRef,
  ]);
}

function SelectContentLayer({
  side = 'bottom',
  align = 'start',
  sideOffset,
  alignOffset,
  avoidCollisions,
  collisionPadding,
  sticky,
  hideWhenDetached,
  collisionBoundary,
  updatePositionStrategy,
  forceMount = false,
  onEscapeKeyDown,
  onPointerDownOutside,
  render,
  ref,
  ...rest
}: SelectContentProps): ReactElement {
  const context = useSelectContext<unknown>('Select.Content');
  const { open, trigger, anchor, contentRef, setMounted, contentHandlersRef } = context;
  const { options: positioning, anchorHidden } = usePositioningOptions({
    sideOffset,
    alignOffset,
    avoidCollisions,
    collisionPadding,
    sticky,
    hideWhenDetached,
    collisionBoundary,
    updatePositionStrategy,
  });
  const direction = useDirection();
  const parentLayer = useContext(DismissLayerContext);
  const layerRef = useRef<DismissLayer | null>(null);
  const [placement, setPlacement] = useState<{ side: OverlaySide; align: OverlayAlign } | null>(null);
  const resolved = placement ?? { side, align };

  // The Content handlers, read live by the layer, which outlives the render that created it.
  useIsomorphicLayoutEffect(() => {
    contentHandlersRef.current = { onEscapeKeyDown, onPointerDownOutside };
  });

  // The Root learns from this fact whether the list is in the document (`aria-controls` follows it); it is false
  // on the server and before the first commit.
  useIsomorphicLayoutEffect(() => {
    setMounted(true);
    return () => {
      setMounted(false);
    };
  }, [setMounted]);

  // The layer lives while the Select is open; an exit animation after that takes no part in dismissal. Focus
  // stays on the trigger the whole time, so there are no guards and no focus to return.
  useSelectDismissLayer(context, layerRef, parentLayer);

  useIsomorphicLayoutEffect(() => {
    if (!open || !trigger || !contentRef.current) return undefined;
    return startOverlayPosition({
      getAnchor: () => anchor ?? trigger,
      getContent: () => contentRef.current,
      side,
      align,
      getDirection: () => direction,
      onPlacementChange: setPlacement,
      ...positioning,
    });
  }, [open, trigger, anchor, side, align, positioning, direction, contentRef]);

  // The Root builds the machine state, so the closed force-mounted list is hidden here, as the machine would.
  const keptClosed = forceMount && !context.keepMounted;
  const machine = toReactProps({
    ...context.parts.content,
    ...(keptClosed || anchorHidden ? { hidden: true as const } : {}),
    'data-side': resolved.side,
    'data-align': resolved.align,
  });
  const props = useSelectPartProps({
    ours: { ...context.theme.content, ...machine },
    rest,
    reserved: RESERVED,
    ref,
    render,
    internalRef: contentRef,
  });
  return (
    <DismissLayerContext.Provider value={layerRef}>
      {renderElement<SelectRenderProps, undefined>(render, 'div', props, undefined)}
    </DismissLayerContext.Provider>
  );
}

function SelectContentImpl(props: SelectContentProps): ReactElement {
  const { keepMounted, trigger } = useSelectContext<unknown>('Select.Content');
  return (
    <Portal open={(keepMounted || props.forceMount === true) && trigger !== null} getTrigger={() => trigger}>
      <SelectContentLayer {...props} />
    </Portal>
  );
}

/**
 * Renders the list: a `<div role="listbox">` (or your `render` element) in a top-layer host outside the Select's
 * parent. It renders nothing while closed (unless `forceMount`), on the server and in the first client render, so a list that is open by
 * default appears right after hydration. It is placed on `side` and `align`, flips and shifts to stay in view, and
 * reports where it is as `data-side` and `data-align`. Positioning props (`sideOffset`, `alignOffset`,
 * `avoidCollisions`, `collisionPadding`, `sticky`, `hideWhenDetached`, `collisionBoundary`,
 * `updatePositionStrategy`) tune where it sits. DOM focus stays on the trigger; the highlighted item is its
 * `aria-activedescendant`. Refuse a dismissal with `onEscapeKeyDown` or `onPointerDownOutside`
 * (`event.preventDefault()`), or any change with `details.cancel()` in `onOpenChange`; refusing Escape weakens the
 * pattern. Focus leaving the trigger is never refused: it chooses the highlighted item of a single Select and
 * closes. Put `Select.Item`s, `Select.Group`s and `Select.Separator`s inside it.
 *
 * @example
 * <Select.Content side="bottom">
 *   <Select.Item value="Cake"><Select.ItemIndicator /><Select.ItemText>Cake</Select.ItemText></Select.Item>
 * </Select.Content>
 * @cckPart content
 * @param props - The Content props.
 * @returns The portal, or nothing while closed.
 */
export const SelectContent: SelectPart<SelectContentProps> = Object.assign(SelectContentImpl, {
  displayName: 'Select.Content',
});
