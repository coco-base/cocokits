'use client';

import { useCallback, useId, useMemo, useRef, useState, type ReactElement } from 'react';
import { createPresence, type Presence } from '@cocokits/cdk/presence';
import { transitionDialog, type DialogEvent } from '@cocokits/machines/dialog';
import { useControllableState } from '../internal/use-controllable-state';
import { useIsomorphicLayoutEffect } from '../internal/use-isomorphic-layout-effect';
import { DialogContext, type DialogContextValue } from './dialog-context';
import type { DialogChangeDetails, DialogPart, DialogRootProps } from './dialog.types';

function DialogRootImpl({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  modal = true,
  children,
}: DialogRootProps): ReactElement {
  const id = useId();
  const [open, setOpen] = useControllableState<boolean, DialogChangeDetails>({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
    name: '<Dialog.Root open>',
    cancelable: true,
  });
  const [trigger, setTrigger] = useState<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [exited, setExited] = useState(true);
  const [titles, setTitles] = useState(0);
  const [descriptions, setDescriptions] = useState(0);
  const contentRef = useRef<HTMLDialogElement | null>(null);
  // Why the dialog opened last: a Dialog opened by its Trigger returns focus to it, any other opens from the opener.
  const openedByTrigger = useRef(false);

  // Read by `dispatch`, which the dismissal listeners created once call.
  const latest = useRef({ id, open, setOpen });
  useIsomorphicLayoutEffect(() => {
    latest.current = { id, open, setOpen };
  });

  const dispatch = useCallback((event: DialogEvent): boolean => {
    const state = latest.current;
    const next = transitionDialog({ id: state.id, open: state.open }, event);
    if (!next) return true;
    const accepted = state.setOpen(next.open, { reason: next.reason, event: event.event });
    if (accepted) openedByTrigger.current = next.open && next.reason === 'trigger';
    return accepted;
  }, []);

  const isOpen = useCallback(() => latest.current.open, []);

  const countTitle = useCallback((delta: 1 | -1) => {
    setTitles((count) => count + delta);
  }, []);
  const countDescription = useCallback((delta: 1 | -1) => {
    setDescriptions((count) => count + delta);
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

  const context = useMemo<DialogContextValue>(
    () => ({
      id,
      open,
      mounted,
      modal,
      keepMounted: open || (mounted && !exited),
      hasTitle: titles > 0,
      hasDescription: descriptions > 0,
      trigger,
      setTrigger,
      setMounted,
      countTitle,
      countDescription,
      contentRef,
      openedByTrigger,
      isOpen,
      dispatch,
    }),
    [id, open, mounted, modal, exited, titles, descriptions, trigger, countTitle, countDescription, isOpen, dispatch],
  );

  return <DialogContext.Provider value={context}>{children}</DialogContext.Provider>;
}

/**
 * Provides the open state to the Trigger, the Content, the Title, the Description and the Close part. It renders
 * no element. Uncontrolled with `defaultOpen`, or controlled with `open` and `onOpenChange`. The dialog is modal
 * unless `modal` is `false`. It closes on Close, on Escape (the topmost layer only), on a press on the backdrop
 * (outside, when it is not modal) and when a `<form method="dialog">` inside it is submitted. A dialog that is not
 * modal also closes when focus moves to an element outside it.
 *
 * @example
 * <Dialog.Root>
 *   <Dialog.Trigger>Delete project</Dialog.Trigger>
 *   <Dialog.Content>
 *     <Dialog.Title>Delete project</Dialog.Title>
 *     <Dialog.Description>This cannot be undone.</Dialog.Description>
 *     <Dialog.Close>Cancel</Dialog.Close>
 *   </Dialog.Content>
 * </Dialog.Root>
 * @cckPart root
 * @param props - The Root props.
 * @returns The children inside the provider.
 */
export const DialogRoot: DialogPart<DialogRootProps> = Object.assign(DialogRootImpl, {
  displayName: 'Dialog.Root',
});
