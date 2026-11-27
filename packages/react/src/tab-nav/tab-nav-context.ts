'use client';

import { createContext, useContext, type Context } from 'react';

/** What a Link tells the Root about itself. */
export interface TabNavRegistration {
  /** A key of the link, stable across renders (`useId`). */
  readonly key: string;
  /** Whether the link is the current page. */
  readonly active: boolean;
  /** Whether the link is disabled. */
  readonly disabled: boolean;
  /** The link element. */
  readonly element: HTMLElement | null;
}

/** The facts of one link that the Root keeps as state. */
export type TabNavListedLink = Pick<TabNavRegistration, 'key' | 'active' | 'disabled'>;

/** What the Root gives its parts. */
export interface TabNavContextValue {
  /** The id of the linked panel; `undefined` in link mode. */
  readonly panelId: string | undefined;
  /** Registers a link; returns the function that unregisters it. */
  readonly register: (read: () => TabNavRegistration) => () => void;
  /** Lists the links again, for a link whose `active` or `disabled` changed. */
  readonly refresh: () => void;
  /** The registered links with their elements, in document order. */
  readonly getEntries: () => readonly TabNavRegistration[];
  /** The links as the Root last listed them, `null` until the first commit; a new list means a change. */
  readonly links: readonly TabNavListedLink[] | null;
  /**
   * The key of the link that holds the Tab stop after mount, `null` when every link is disabled, `undefined`
   * before the first commit (links then use {@link TabNavContextValue.claim}).
   */
  readonly stop: string | null | undefined;
  /**
   * The Tab stop during the first render, in render order: an active link, else the first enabled link to ask
   * (unless the Root already saw an active link among its children). Asking again with the same key gives the same
   * answer, so a repeated render claims the same link.
   */
  readonly claim: (key: string, active: boolean, disabled: boolean) => boolean;
}

/** The context of the Root. */
export const TabNavContext: Context<TabNavContextValue | null> = createContext<TabNavContextValue | null>(null);

/**
 * Reads the Root's context.
 *
 * @param part - The part that asks, for the error message, such as `TabNav.Link`.
 * @returns The context.
 * @throws When the part is not inside a `TabNav.Root`.
 */
export function useTabNavContext(part: string): TabNavContextValue {
  const context = useContext(TabNavContext);
  if (context === null) throw new Error(`CocoKits: <${part}> must be placed within <TabNav.Root>.`);
  return context;
}
