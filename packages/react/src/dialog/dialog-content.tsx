'use client';

import { useContext, useEffect, useRef, useState, type ReactElement, type SyntheticEvent } from 'react';
import { createDismissLayer, type DismissLayer } from '@cocokits/cdk/dismissal';
import { captureFocusReturn, deepActiveElement, scheduleFocus, type FocusReturn } from '@cocokits/cdk/focus';
import { lockScroll } from '@cocokits/cdk/scroll-lock';
import { dialogAnatomy, getDialogProps } from '@cocokits/machines/dialog';
import { Portal, toReactProps, useThemeAttrs } from '@cocokits/react-core';
import { hasAccessibleName } from '@cocokits/utils';
import { allowsAutoFocus, runDismissHandlers } from '../internal/dismiss-handlers';
import { isDevelopment } from '../internal/dev';
import { DismissLayerContext } from '../internal/dismiss-layer-context';
import { mergeProps, withoutReserved } from '../internal/merge-props';
import { useIsomorphicLayoutEffect } from '../internal/use-isomorphic-layout-effect';
import { useMergedRef } from '../internal/use-merged-ref';
import { useModalAtOpen } from '../internal/use-modal-at-open';
import { useDialogContext } from './dialog-context';
import type { DialogContentProps, DialogPart } from './dialog.types';

/** The attributes the machine owns; the trigger's `aria-controls` points at `id`. */
const RESERVED = ['id', 'data-state'];

function DialogContentLayer({
  forceMount = false,
  ref,
  children,
  onEscapeKeyDown,
  onPointerDownOutside,
  onInteractOutside,
  onOpenAutoFocus,
  onCloseAutoFocus,
  ...rest
}: DialogContentProps): ReactElement {
  const context = useDialogContext('Dialog.Content');
  const { open, trigger, dispatch, contentRef, setMounted, isOpen, keepMounted, openedByTrigger } = context;
  // The value the dialog opened with, kept until its exit animation is over.
  const modal = useModalAtOpen(keepMounted, context.modal);
  const themeAttrs = useThemeAttrs(dialogAnatomy).content;
  const parentLayer = useContext(DismissLayerContext);
  const layerRef = useRef<DismissLayer | null>(null);
  // The layer and the scroll lock outlive `open`: they end when the native modal has left the document.
  const held = useRef<{ layer: DismissLayer; unlock: (() => void) | undefined } | null>(null);
  const forceMountNow = useRef(forceMount);
  const triggerRef = useRef(trigger);
  const focusReturn = useRef<FocusReturn | null>(null);

  const mergedRef = useMergedRef<HTMLElement>(ref, undefined, contentRef);

  // Read by the layer, the open hook and the close hook, which outlive the render that created them.
  const handlers = useRef({
    onEscapeKeyDown,
    onPointerDownOutside,
    onInteractOutside,
    onOpenAutoFocus,
    onCloseAutoFocus,
  });
  useIsomorphicLayoutEffect(() => {
    handlers.current = { onEscapeKeyDown, onPointerDownOutside, onInteractOutside, onOpenAutoFocus, onCloseAutoFocus };
    forceMountNow.current = forceMount;
  });

  useIsomorphicLayoutEffect(() => {
    triggerRef.current = trigger;
  }, [trigger]);

  // The Trigger reads `aria-controls` from this fact while the content element exists.
  useIsomorphicLayoutEffect(() => {
    setMounted(true);
    return () => {
      setMounted(false);
    };
  }, [setMounted]);

  // The dialog is shown while it is open and during its exit animation (`keepMounted`): modal when it opened modal
  // (the native focusing steps place focus), else non-modal. When that ends, the layer and the scroll lock end, a
  // force-mounted dialog is closed natively, and focus goes back to the opener when the dialog was closed (not when
  // the tree was removed).
  useIsomorphicLayoutEffect(() => {
    const dialog = contentRef.current;
    if (!keepMounted || !dialog) return undefined;
    // The opener is the element that has focus before the native focusing steps move it into the dialog. The first
    // capture is kept when StrictMode runs the effect again.
    focusReturn.current ??= captureFocusReturn({
      getTrigger: () => triggerRef.current,
      getContent: () => contentRef.current,
      restoreTo: openedByTrigger.current ? 'trigger' : 'opener',
    });
    if (!dialog.open) {
      if (modal) dialog.showModal();
      else dialog.show();
      // The native focusing steps have run: the hook can only keep CocoKits from moving focus elsewhere.
      allowsAutoFocus('focus-open', handlers.current.onOpenAutoFocus);
    }
    return () => {
      held.current?.layer.destroy();
      held.current?.unlock?.();
      held.current = null;
      layerRef.current = null;
      if (forceMountNow.current && dialog.isConnected && dialog.open) dialog.close();
      const doc = dialog.ownerDocument;
      // A frame later, so the removal of the dialog (it is inert until then) and any blur have settled.
      scheduleFocus(doc, () => {
        if (isOpen()) return;
        if (allowsAutoFocus('focus-close', handlers.current.onCloseAutoFocus)) focusReturn.current?.restore();
        focusReturn.current = null;
      });
    };
  }, [contentRef, keepMounted, modal, isOpen, openedByTrigger]);

  // A layer starts when the dialog opens. When it closes the layer only exits: it raises no intent, but stays a
  // barrier for the layers below (a modal one) and the page stays locked until the exit animation is over. They start
  // in a layout effect, not in a ref callback: the content stays mounted when `open` flips, so a ref callback would
  // have to change identity and would detach the author's `ref`. A dialog that is not modal is a layer like a
  // non-modal popover: the trigger is inside it, a focus outside closes it, and nothing is locked.
  useIsomorphicLayoutEffect(() => {
    const dialog = contentRef.current;
    if (!open || !dialog) return undefined;
    held.current?.layer.destroy();
    const layer = createDismissLayer({
      getInsideElements: () => [contentRef.current, ...(modal ? [] : [triggerRef.current])],
      getNativeDialog: () => contentRef.current,
      onDismiss: (intent) => {
        runDismissHandlers(intent, handlers.current);
        if (intent.defaultPrevented) return;
        const { event } = intent;
        // A modal dialog does not listen for focus-out. For a dialog that is not modal it counts as an outside
        // press: the change reasons of a dialog are Escape, an outside press, the trigger and Close.
        if (intent.reason === 'focus-out' && modal) return;
        const reason = intent.reason === 'focus-out' ? 'outside-press' : intent.reason;
        // `onOpenChange` can refuse too, with `details.cancel()`: the layers below then stay open as well.
        if (!dispatch({ type: 'CONTENT.DISMISS', reason, event })) intent.preventDefault();
      },
      ...(modal ? {} : { dismissOn: ['escape', 'outside-press', 'focus-out'] as const }),
      getParent: () => parentLayer?.current ?? null,
    });
    layerRef.current = layer;
    held.current = { layer, unlock: held.current?.unlock ?? (modal ? lockScroll(dialog.ownerDocument) : undefined) };
    return () => {
      layer.exit();
    };
  }, [open, dispatch, parentLayer, contentRef, modal]);

  useEffect(() => {
    if (!isDevelopment()) return undefined;
    // After the Title has labelled the content.
    const frame = requestAnimationFrame(() => {
      if (contentRef.current && !hasAccessibleName(contentRef.current)) {
        console.warn(
          'CocoKits: <Dialog.Content> has no accessible name. Add a <Dialog.Title>, or an aria-label or aria-labelledby.',
        );
      }
    });
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [contentRef]);

  const { content } = getDialogProps(
    {
      id: context.id,
      open,
      mounted: true,
      hasTitle: context.hasTitle,
      hasDescription: context.hasDescription,
    },
    dispatch,
  );
  const machineProps = toReactProps({ ...content, onClose: undefined });
  const ours = {
    ...themeAttrs,
    ...machineProps,
    // The platform closed the dialog (a `<form method="dialog">`). A parent that refuses the change keeps it open.
    onClose: (event: SyntheticEvent<HTMLDialogElement>) => {
      content.onClose(event.nativeEvent);
      const dialog = event.currentTarget;
      scheduleFocus(dialog.ownerDocument, () => {
        if (!isOpen() || !dialog.isConnected || dialog.open) return;
        if (modal) dialog.showModal();
        else dialog.show();
      });
    },
    ref: mergedRef,
    children,
  };
  const props = mergeProps(ours, withoutReserved(rest, RESERVED));

  return (
    <DismissLayerContext.Provider value={layerRef}>
      <dialog {...props} />
    </DismissLayerContext.Provider>
  );
}

function DialogContentImpl(props: DialogContentProps): ReactElement {
  const { keepMounted, trigger } = useDialogContext('Dialog.Content');
  const forceMount = props.forceMount === true;
  // A Trigger registers during the first commit. After it, a Content with no Trigger is a dialog opened from code:
  // its anchor (the container, the modes and the direction come from it) is the element that has focus as it opens.
  const [committed, setCommitted] = useState(false);
  useIsomorphicLayoutEffect(() => {
    setCommitted(true);
  }, []);
  const opener = useRef<Element | null>(null);
  useIsomorphicLayoutEffect(() => {
    if (!keepMounted) opener.current = null;
  }, [keepMounted]);
  const getAnchor = (): Element => {
    if (trigger) return trigger;
    opener.current ??= deepActiveElement(document) ?? document.body;
    return opener.current;
  };
  return (
    <Portal open={(keepMounted || forceMount) && (trigger !== null || committed)} getTrigger={getAnchor}>
      <DialogContentLayer {...props} />
    </Portal>
  );
}

/**
 * Renders a `<dialog>` opened with `showModal()` (or `show()` when the Root is not `modal`) in a top-layer host: in the open modal dialog that holds
 * the trigger, else at the end of `<body>`. With `modal`, the rest of the page is inert and Tab moves through its
 * controls; the browser decides what follows the last one, so there is no focus trap of our own; focus starts where the browser puts it (an `autofocus` element, else the first
 * focusable). It renders nothing while closed (unless `forceMount`, which keeps the closed `dialog` in the document after hydration), on the server and in the first client render, so a dialog that is
 * open by default appears right after hydration. It is named by `Dialog.Title` and described by
 * `Dialog.Description` while they are mounted; without a Title give it `aria-label`. Escape closes the topmost
 * layer only; a press on the backdrop closes it. Refuse either with `onEscapeKeyDown`, `onPointerDownOutside` or
 * `onInteractOutside` (`event.preventDefault()`), or any change with `details.cancel()` in `onOpenChange`. Refusing
 * Escape weakens the dialog pattern: keep another way to close it. The page does not scroll while it is open, and
 * focus returns to the trigger when the trigger opened it, else to the element that had focus when it opened
 * (whatever opened it from code), when it closes; `onOpenAutoFocus` and `onCloseAutoFocus` can stop CocoKits from moving focus. A dialog needs no
 * `Dialog.Trigger`: open it with `open`.
 *
 * @example
 * <Dialog.Content>
 *   <Dialog.Title>Delete project</Dialog.Title>
 *   <Dialog.Close>Cancel</Dialog.Close>
 * </Dialog.Content>
 * @cckPart content
 * @param props - The Content props.
 * @returns The portal, or nothing while closed.
 */
export const DialogContent: DialogPart<DialogContentProps> = Object.assign(DialogContentImpl, {
  displayName: 'Dialog.Content',
});
