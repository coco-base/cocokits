'use client';

import { useCallback, useId, useMemo, useRef, useState, type ReactElement } from 'react';
import { createPresence, type Presence } from '@cocokits/cdk/presence';
import { transitionPopover, type PopoverEvent } from '@cocokits/machines/popover';
import { useControllableState } from '../internal/use-controllable-state';
import { useIsomorphicLayoutEffect } from '../internal/use-isomorphic-layout-effect';
import { PopoverContext, type PopoverAnchorSource, type PopoverContextValue } from './popover-context';
import type { PopoverChangeDetails, PopoverPart, PopoverRootProps } from './popover.types';

function PopoverRootImpl({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  modal = false,
  children,
}: PopoverRootProps): ReactElement {
  const id = useId();
  const [open, setOpen] = useControllableState<boolean, PopoverChangeDetails>({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
    name: '<Popover.Root open>',
    cancelable: true,
  });
  const [trigger, setTrigger] = useState<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [exited, setExited] = useState(true);
  const [titles, setTitles] = useState(0);
  const [descriptions, setDescriptions] = useState(0);
  const [anchor, setAnchor] = useState<PopoverAnchorSource | null>(null);
  const contentRef = useRef<HTMLElement | null>(null);

  // Read by `dispatch`, which the dismissal listeners created once call.
  const latest = useRef({ id, open, setOpen });
  useIsomorphicLayoutEffect(() => {
    latest.current = { id, open, setOpen };
  });

  const dispatch = useCallback((event: PopoverEvent): boolean => {
    const state = latest.current;
    const next = transitionPopover({ id: state.id, open: state.open }, event);
    return next ? state.setOpen(next.open, { reason: next.reason, event: event.event }) : true;
  }, []);

  const countTitle = useCallback((delta: 1 | -1) => {
    setTitles((count) => count + delta);
  }, []);
  const countDescription = useCallback((delta: 1 | -1) => {
    setDescriptions((count) => count + delta);
  }, []);
  // The last Anchor mounted is used; removing an older one leaves the newer in place.
  const registerAnchor = useCallback((source: PopoverAnchorSource) => {
    setAnchor(() => source);
    return () => {
      setAnchor((current) => (current === source ? null : current));
    };
  }, []);

  // The content stays in the document after `open` turns false until the exit animation has finished: it is
  // rendered while it is mounted and the presence has not reported `unmounted`.
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
    presence.current?.setOpen(open);
  }, [open]);

  const context = useMemo<PopoverContextValue>(
    () => ({
      id,
      open,
      mounted,
      modal,
      keepMounted: open || (mounted && !exited),
      hasTitle: titles > 0,
      hasDescription: descriptions > 0,
      countTitle,
      countDescription,
      anchor,
      registerAnchor,
      trigger,
      setTrigger,
      setMounted,
      contentRef,
      dispatch,
    }),
    [
      id,
      open,
      mounted,
      modal,
      exited,
      titles,
      descriptions,
      anchor,
      trigger,
      countTitle,
      countDescription,
      registerAnchor,
      dispatch,
    ],
  );

  return <PopoverContext.Provider value={context}>{children}</PopoverContext.Provider>;
}

/**
 * A panel that opens next to a trigger, with content the user can act on. The Root renders no element; it gives the
 * open state to its parts.
 *
 * Control the open state with `open` and `onOpenChange`, or set `defaultOpen` and let the popover keep it.
 *
 * It closes on the trigger, on a Close, on Escape, on a press outside, and when the focus leaves the trigger and
 * the content. Escape closes only the top layer. With `modal`, the page outside is inert and Tab stays in the
 * content.
 *
 * @example
 * <Popover.Root>
 *   <Popover.Anchor>
 *     <Popover.Trigger>Share</Popover.Trigger>
 *   </Popover.Anchor>
 *   <Popover.Content>
 *     <Popover.Arrow />
 *     <Popover.Title>Share this page</Popover.Title>
 *     <Popover.Description>Anyone with the link can view it.</Popover.Description>
 *     <Popover.Close>Done</Popover.Close>
 *   </Popover.Content>
 * </Popover.Root>
 * @cckPart root
 * @param props - The Root props.
 * @returns The children inside the provider.
 */
export const PopoverRoot: PopoverPart<PopoverRootProps> = Object.assign(PopoverRootImpl, {
  displayName: 'Popover.Root',
});
