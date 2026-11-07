'use client';

import { createContext, useContext, type Context, type RefObject } from 'react';
import type {
  AccordionEvent,
  AccordionItemParts,
  AccordionOrientation,
  AccordionState as MachineState,
} from '@cocokits/machines/accordion';

/** What an Item tells the Root about itself. */
export interface AccordionRegistration {
  /** The item value. */
  readonly value: string;
  /** Whether the item is disabled by its own prop. */
  readonly disabled: boolean;
  /** The item element; it gives the document order. */
  readonly element: HTMLElement | null;
  /** The trigger element. */
  readonly trigger: HTMLElement | null;
  /** The content element, `null` while it is not rendered. */
  readonly content: HTMLElement | null;
}

/** What the Root gives its parts. */
export interface AccordionContextValue {
  /** The machine state; each item computes its own props from it. */
  readonly state: MachineState;
  /** Sends a machine event of a trigger. */
  readonly dispatch: (event: AccordionEvent) => void;
  /** The orientation. */
  readonly orientation: AccordionOrientation;
  /** Registers an item; returns the function that unregisters it. */
  readonly register: (read: () => AccordionRegistration) => () => void;
  /** The trigger element of a value, `undefined` when none is registered. */
  readonly getTrigger: (value: string) => HTMLElement | undefined;
  /** Marks the trigger of this value as keyboard-focused when the last input was the keyboard. */
  readonly focusTrigger: (value: string) => void;
  /** Clears the keyboard-focus mark. */
  readonly blurTrigger: () => void;
}

/** What an Item gives its header, trigger and content. */
export interface AccordionItemContextValue {
  /** The machine props of the item and its parts. */
  readonly parts: AccordionItemParts;
  /** Whether the item is open. */
  readonly open: boolean;
  /** Whether the item is disabled, by its own prop or the Root's. */
  readonly disabled: boolean;
  /** The item value. */
  readonly value: string;
  /** Whether the content is rendered: open, still closing, or force-mounted. */
  readonly present: boolean;
  /** The trigger element, for the Root. */
  readonly triggerRef: RefObject<HTMLElement | null>;
  /** The content element, for the exit animation, the size and the focus check. */
  readonly contentRef: RefObject<HTMLElement | null>;
  /** Tells the Item whether its content is force-mounted, which decides `aria-controls`. */
  readonly setForceMounted: (forceMounted: boolean) => void;
}

/** The context of the Root. */
export const AccordionContext: Context<AccordionContextValue | null> = createContext<AccordionContextValue | null>(
  null,
);

/** The context of the Item. */
export const AccordionItemContext: Context<AccordionItemContextValue | null> =
  createContext<AccordionItemContextValue | null>(null);

/**
 * Reads the Root's context.
 *
 * @param part - The part that asks, for the error message, such as `Accordion.Item`.
 * @returns The context.
 * @throws When the part is not inside an `Accordion.Root`.
 */
export function useAccordionContext(part: string): AccordionContextValue {
  const context = useContext(AccordionContext);
  if (context === null) throw new Error(`CocoKits: <${part}> must be placed within <Accordion.Root>.`);
  return context;
}

/**
 * Reads the Item's context.
 *
 * @param part - The part that asks, for the error message, such as `Accordion.Trigger`.
 * @returns The context.
 * @throws When the part is not inside an `Accordion.Item`.
 */
export function useAccordionItemContext(part: string): AccordionItemContextValue {
  const context = useContext(AccordionItemContext);
  if (context === null) throw new Error(`CocoKits: <${part}> must be placed within <Accordion.Item>.`);
  return context;
}
