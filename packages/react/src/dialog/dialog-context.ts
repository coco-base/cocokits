'use client';

import { createContext, useContext, type Context, type RefObject } from 'react';
import type { DialogEvent } from '@cocokits/machines/dialog';

/** What the Root gives its parts. */
export interface DialogContextValue {
  /** The SSR-stable id of the dialog. */
  readonly id: string;
  /** The open model. */
  readonly open: boolean;
  /** Whether the content is in the document: open, or closed with its exit animation running. */
  readonly mounted: boolean;
  /** Whether the content must be rendered: open, or closed with its exit animation still running. */
  readonly keepMounted: boolean;
  /** Whether the dialog is modal (the `modal` prop of the Root). */
  readonly modal: boolean;
  /** Whether a Title is mounted. */
  readonly hasTitle: boolean;
  /** Whether a Description is mounted. */
  readonly hasDescription: boolean;
  /** The trigger element, `null` until it is attached. */
  readonly trigger: HTMLElement | null;
  /** Registers the trigger element; the Trigger puts it in its ref. */
  readonly setTrigger: (element: HTMLElement | null) => void;
  /** Reports whether the content is in the document. */
  readonly setMounted: (mounted: boolean) => void;
  /** Counts a mounted Title (`+1`) or its removal (`-1`). */
  readonly countTitle: (delta: 1 | -1) => void;
  /** Counts a mounted Description (`+1`) or its removal (`-1`). */
  readonly countDescription: (delta: 1 | -1) => void;
  /** The content element, for the exit animation. */
  readonly contentRef: RefObject<HTMLDialogElement | null>;
  /** Whether the Trigger opened the dialog (else it was opened from code or by a controlled `open`). */
  readonly openedByTrigger: RefObject<boolean>;
  /** Whether the dialog is open right now, for handlers that run after a state change. */
  readonly isOpen: () => boolean;
  /** Sends a machine event; the Root decides the open change and reports it. `false` when `onOpenChange` canceled it. */
  readonly dispatch: (event: DialogEvent) => boolean;
}

/** The context of the Root. */
export const DialogContext: Context<DialogContextValue | null> = createContext<DialogContextValue | null>(null);

/**
 * Reads the Root's context.
 *
 * @param part - The part that asks, for the error message, such as `Dialog.Trigger`.
 * @returns The context.
 * @throws When the part is not inside a `Dialog.Root`.
 */
export function useDialogContext(part: string): DialogContextValue {
  const context = useContext(DialogContext);
  if (context === null) throw new Error(`CocoKits: <${part}> must be placed within <Dialog.Root>.`);
  return context;
}
