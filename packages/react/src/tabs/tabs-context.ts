'use client';

import { createContext, useContext, type Context } from 'react';
import type { TabsActivationMode, TabsEvent, TabsItem, TabsOrientation, TabsState } from '@cocokits/machines/tabs';

/** What a Trigger tells the Root about itself. */
export interface TabsRegistration {
  /** The tab value. */
  readonly value: string;
  /** Whether the trigger is disabled. */
  readonly disabled: boolean;
  /** The trigger element. */
  readonly element: HTMLElement | null;
}

/** What the Root gives its parts. */
export interface TabsContextValue {
  /** The machine state; each part computes its own props from it. */
  readonly state: TabsState;
  /** Sends a machine event of a trigger. */
  readonly dispatch: (event: TabsEvent) => void;
  /** The selected value, `undefined` before any trigger has registered and no value was given. */
  readonly selected: string | undefined;
  /** The orientation. */
  readonly orientation: TabsOrientation;
  /** The activation mode. */
  readonly activationMode: TabsActivationMode;
  /** Registers a trigger; returns the function that unregisters it. */
  readonly register: (read: () => TabsRegistration) => () => void;
  /** The trigger element of a value, `undefined` when none is registered. */
  readonly getTrigger: (value: string) => HTMLElement | undefined;
  /** Marks the trigger of this value as keyboard-focused when the last input was the keyboard. */
  readonly focusTrigger: (value: string) => void;
  /** Clears the keyboard-focus mark. */
  readonly blurTrigger: () => void;
  /** The registered triggers with their elements, in document order. */
  readonly getEntries: () => readonly TabsRegistration[];
  /** The registered tabs in document order. */
  readonly items: readonly TabsItem[];
  /** Lists the tabs again, for a trigger whose `value` or `disabled` changed. */
  readonly refresh: () => void;
}

/** The context of the Root. */
export const TabsContext: Context<TabsContextValue | null> = createContext<TabsContextValue | null>(null);

/**
 * Reads the Root's context.
 *
 * @param part - The part that asks, for the error message, such as `Tabs.Trigger`.
 * @returns The context.
 * @throws When the part is not inside a `Tabs.Root`.
 */
export function useTabsContext(part: string): TabsContextValue {
  const context = useContext(TabsContext);
  if (context === null) throw new Error(`CocoKits: <${part}> must be placed within <Tabs.Root>.`);
  return context;
}
