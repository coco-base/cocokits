'use client';

import { useCallback, useContext, useId, useMemo, useRef, useState, type ReactElement } from 'react';
import { trackFocusVisible, type FocusVisibleTracker } from '@cocokits/cdk/focus';
import { createPresence, type Presence } from '@cocokits/cdk/presence';
import { createDescription, type Description } from '@cocokits/cdk/portal';
import { tooltipIds, transitionTooltip, type TooltipDescription, type TooltipEvent } from '@cocokits/machines/tooltip';
import { useControllableState } from '../internal/use-controllable-state';
import { useIsomorphicLayoutEffect } from '../internal/use-isomorphic-layout-effect';
import { TooltipContext, type TooltipContextValue } from './tooltip-context';
import { TooltipProviderContext } from './tooltip-provider-context';
import type { TooltipChangeDetails, TooltipPart, TooltipRootProps } from './tooltip.types';

function TooltipRootImpl({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  delayDuration,
  disableHoverableContent,
  disabled = false,
  children,
}: TooltipRootProps): ReactElement {
  const id = useId();
  const provider = useContext(TooltipProviderContext);
  const delay = delayDuration ?? provider?.delayDuration ?? 700;
  const hoverableOff = disableHoverableContent ?? provider?.disableHoverableContent ?? false;
  const group = provider?.group;
  const [open, setOpen, setOpenQuietly] = useControllableState<boolean, TooltipChangeDetails>({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
    name: '<Tooltip.Root open>',
    cancelable: true,
  });
  const shown = open && !disabled;
  const [trigger, setTrigger] = useState<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [exited, setExited] = useState(true);
  const contentRef = useRef<HTMLElement | null>(null);

  // Read by `dispatch` and by the timer, which outlive the render that created them.
  const latest = useRef({ id, open, setOpen, delay, disableHoverableContent: hoverableOff, disabled, group });
  useIsomorphicLayoutEffect(() => {
    latest.current = { id, open, setOpen, delay, disableHoverableContent: hoverableOff, disabled, group };
  });

  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const cancel = useCallback((): void => {
    clearTimeout(timer.current);
    timer.current = undefined;
  }, []);
  useIsomorphicLayoutEffect(() => cancel, [cancel]);
  // Turning `disabled` on drops a pending show and closes an open tooltip without telling the parent, which caused
  // it: an uncontrolled tooltip does not show again when `disabled` turns off.
  useIsomorphicLayoutEffect(() => {
    if (!disabled) return;
    cancel();
    setOpenQuietly(false);
  }, [disabled, cancel, setOpenQuietly]);

  const dispatch = useCallback(
    (event: TooltipEvent): boolean => {
      const next = transitionTooltip(latest.current, event);
      if (!next) return true;
      cancel();
      const schedule = next.schedule;
      if (!schedule) return true;
      // Inside a delay group a hover waits less: nothing while another tooltip of the group is open or just closed.
      const wait =
        schedule.open && schedule.reason === 'hover' && latest.current.group
          ? latest.current.group.delayFor(schedule.delay)
          : schedule.delay;
      const apply = (): boolean => {
        timer.current = undefined;
        const state = latest.current;
        if (state.open === schedule.open || state.disabled) return true;
        return state.setOpen(schedule.open, { reason: schedule.reason, event: event.event });
      };
      if (wait > 0) {
        timer.current = setTimeout(apply, wait);
        return true;
      }
      return apply();
    },
    [cancel],
  );

  // The group knows which of its tooltips are shown, and when the last one closed.
  useIsomorphicLayoutEffect(() => {
    if (!shown || !group) return undefined;
    group.opened();
    return () => {
      group.closed();
    };
  }, [shown, group]);

  // A scrolling ancestor of the trigger (the document included) moves the trigger away from the content.
  useIsomorphicLayoutEffect(() => {
    const view = trigger?.ownerDocument.defaultView;
    if (!shown || !trigger || !view) return undefined;
    const onScroll = (event: Event): void => {
      if (event.target instanceof Node && event.target.contains(trigger)) dispatch({ type: 'ANCESTOR.SCROLL', event });
    };
    view.addEventListener('scroll', onScroll, { capture: true, passive: true });
    return () => {
      view.removeEventListener('scroll', onScroll, { capture: true });
    };
  }, [shown, trigger, dispatch]);

  // The description element of the trigger, made after mount: the server and the first render know none.
  const [descriptionText, setDescriptionText] = useState<string | null>(null);
  const [triggerLabel, setTriggerLabel] = useState<string | undefined>(undefined);
  const [description, setDescription] = useState<TooltipDescription>('none');
  const descriptionRef = useRef<Description | null>(null);
  useIsomorphicLayoutEffect(() => {
    if (!trigger) return undefined;
    const created = createDescription(trigger, { id: tooltipIds(id).description });
    descriptionRef.current = created;
    return () => {
      created.destroy();
      descriptionRef.current = null;
    };
  }, [trigger, id]);
  useIsomorphicLayoutEffect(() => {
    const element = descriptionRef.current;
    if (!element || disabled || descriptionText === null) {
      element?.update('');
      setDescription('none');
      return;
    }
    setDescription(element.update(descriptionText) ? 'described' : 'suppressed');
  }, [trigger, descriptionText, triggerLabel, disabled]);

  // Nothing is tracked on the server, where nothing can be focused anyway.
  const tracker = useRef<FocusVisibleTracker | null>(null);
  useIsomorphicLayoutEffect(() => {
    const created = trackFocusVisible(document);
    tracker.current = created;
    return () => {
      created.destroy();
      tracker.current = null;
    };
  }, []);
  const isFocusVisible = useCallback((): boolean => tracker.current?.isFocusVisible() ?? false, []);

  // The content stays in the document after `shown` turns false until the exit animation has finished.
  const presence = useRef<Presence | null>(null);
  useIsomorphicLayoutEffect(() => {
    const created = createPresence({
      getElement: () => contentRef.current,
      onStateChange: (state) => {
        setExited(state === 'unmounted');
      },
    });
    presence.current = created;
    return () => {
      created.destroy();
      presence.current = null;
    };
  }, []);
  // After the closed state is rendered, so the exit animation already exists when it is read.
  useIsomorphicLayoutEffect(() => {
    presence.current?.setOpen(shown);
  }, [shown]);

  const context = useMemo<TooltipContextValue>(
    () => ({
      id,
      open: shown,
      disabled,
      mounted,
      keepMounted: shown || (mounted && !exited),
      trigger,
      setTrigger,
      setMounted,
      contentRef,
      description,
      setDescriptionText,
      setTriggerLabel,
      isFocusVisible,
      dispatch,
    }),
    [id, shown, disabled, mounted, exited, trigger, description, isFocusVisible, dispatch],
  );

  return <TooltipContext.Provider value={context}>{children}</TooltipContext.Provider>;
}

/**
 * A short text that describes a focusable element, shown on hover and on keyboard focus. The Root renders no
 * element; it gives the open state to the Trigger and the Content.
 *
 * Control the open state with `open` and `onOpenChange`, or set `defaultOpen` and let the tooltip keep it.
 *
 * It shows after `delayDuration` on a mouse or pen hover, and at once on keyboard focus. A touch never shows it.
 *
 * It hides shortly after the pointer leaves the trigger and the content, or at once with
 * `disableHoverableContent`. It also hides on blur, on Escape, on a press on the trigger and when a parent of the
 * trigger scrolls.
 *
 * `delayDuration` and `disableHoverableContent` take the values of the `Tooltip.Provider` around it. Text children
 * of the Content, or its `aria-label`, describe the trigger while the tooltip is closed.
 *
 * @example
 * <Tooltip.Provider>
 *   <Tooltip.Root>
 *     <Tooltip.Trigger aria-label="Copy link">
 *       <svg aria-hidden="true">...</svg>
 *     </Tooltip.Trigger>
 *     <Tooltip.Content>
 *       Copy link
 *       <Tooltip.Arrow />
 *     </Tooltip.Content>
 *   </Tooltip.Root>
 * </Tooltip.Provider>
 * @cckPart root
 * @param props - The Root props.
 * @returns The children inside the provider.
 */
export const TooltipRoot: TooltipPart<TooltipRootProps> = Object.assign(TooltipRootImpl, {
  displayName: 'Tooltip.Root',
});
