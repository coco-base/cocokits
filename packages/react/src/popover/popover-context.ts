'use client';

import { createContext, useContext, type Context, type RefObject } from 'react';
import type { OverlayVirtualAnchor } from '@cocokits/cdk/positioning';
import type { PopoverEvent } from '@cocokits/machines/popover';

/** Gives the element or virtual anchor the content is placed against; `null` while a virtual reference is empty. */
export type PopoverAnchorSource = () => Element | OverlayVirtualAnchor | null;

/** What the Root gives its parts. */
export interface PopoverContextValue {
  /** The SSR-stable id of the popover. */
  readonly id: string;
  /** The open model. */
  readonly open: boolean;
  /** Whether the content is in the document: open, or closed with its exit animation running. */
  readonly mounted: boolean;
  /** Whether the content must be rendered: open, or closed with its exit animation still running. */
  readonly keepMounted: boolean;
  /** Whether the popover is modal (the `modal` prop of the Root). */
  readonly modal: boolean;
  /** The trigger element, `null` until it is attached. */
  readonly trigger: HTMLElement | null;
  /** Whether a Title is mounted. */
  readonly hasTitle: boolean;
  /** Whether a Description is mounted. */
  readonly hasDescription: boolean;
  /** Counts a mounted Title (`+1`) or its removal (`-1`). */
  readonly countTitle: (delta: 1 | -1) => void;
  /** Counts a mounted Description (`+1`) or its removal (`-1`). */
  readonly countDescription: (delta: 1 | -1) => void;
  /** The mounted Anchor's source, `null` when there is none and the content is placed against the trigger. */
  readonly anchor: PopoverAnchorSource | null;
  /** Registers an Anchor (the last one wins); the returned function removes it. */
  readonly registerAnchor: (source: PopoverAnchorSource) => () => void;
  /** Registers the trigger element; the Trigger puts it in its ref. */
  readonly setTrigger: (element: HTMLElement | null) => void;
  /** Reports whether the content is in the document. */
  readonly setMounted: (mounted: boolean) => void;
  /** The content element, for the exit animation. */
  readonly contentRef: RefObject<HTMLElement | null>;
  /** Sends a machine event; the Root decides the open change and reports it. `false` when `onOpenChange` canceled it. */
  readonly dispatch: (event: PopoverEvent) => boolean;
}

/** The context of the Root. */
export const PopoverContext: Context<PopoverContextValue | null> = createContext<PopoverContextValue | null>(null);

/**
 * Reads the Root's context.
 *
 * @param part - The part that asks, for the error message, such as `Popover.Trigger`.
 * @returns The context.
 * @throws When the part is not inside a `Popover.Root`.
 */
export function usePopoverContext(part: string): PopoverContextValue {
  const context = useContext(PopoverContext);
  if (context === null) throw new Error(`CocoKits: <${part}> must be placed within <Popover.Root>.`);
  return context;
}
