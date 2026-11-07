'use client';

import { createContext, useContext, type Context, type RefObject } from 'react';
import type { TooltipDescription, TooltipEvent } from '@cocokits/machines/tooltip';

/** What the Root gives its parts. */
export interface TooltipContextValue {
  /** The SSR-stable id of the tooltip. */
  readonly id: string;
  /** Whether the tooltip is shown: open and not disabled. */
  readonly open: boolean;
  /** Whether the tooltip is disabled. */
  readonly disabled: boolean;
  /** Whether the content is in the document: shown, or hidden with its exit animation running. */
  readonly mounted: boolean;
  /** Whether the content must be rendered: shown, or hidden with its exit animation still running. */
  readonly keepMounted: boolean;
  /** The trigger element, `null` until it is attached. */
  readonly trigger: HTMLElement | null;
  /** Registers the trigger element; the Trigger puts it in its ref. */
  readonly setTrigger: (element: HTMLElement | null) => void;
  /** Reports whether the content is in the document. */
  readonly setMounted: (mounted: boolean) => void;
  /** The content element, for the exit animation. */
  readonly contentRef: RefObject<HTMLElement | null>;
  /** How the trigger is described; `none` on the server and before the first commit. */
  readonly description: TooltipDescription;
  /** Reports the text that describes the trigger, or `null` when there is none. The Content calls it. */
  readonly setDescriptionText: (text: string | null) => void;
  /** Reports the trigger's own `aria-label`, which a description text equal to it is dropped for. */
  readonly setTriggerLabel: (label: string | undefined) => void;
  /** Whether the last input was the keyboard; `false` on the server. */
  readonly isFocusVisible: () => boolean;
  /** Sends a machine event; the Root runs the timers and reports the change. `false` when `onOpenChange` canceled it now. */
  readonly dispatch: (event: TooltipEvent) => boolean;
}

/** The context of the Root. */
export const TooltipContext: Context<TooltipContextValue | null> = createContext<TooltipContextValue | null>(null);

/**
 * Reads the Root's context.
 *
 * @param part - The part that asks, for the error message, such as `Tooltip.Trigger`.
 * @returns The context.
 * @throws When the part is not inside a `Tooltip.Root`.
 */
export function useTooltipContext(part: string): TooltipContextValue {
  const context = useContext(TooltipContext);
  if (context === null) throw new Error(`CocoKits: <${part}> must be placed within <Tooltip.Root>.`);
  return context;
}
