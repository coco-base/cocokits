'use client';

import { createContext, useContext, type Context, type RefObject } from 'react';
import type { Typeahead } from '@cocokits/cdk/roving-focus';
import type { MenuEvent, MenuItemEntry } from '@cocokits/machines/menu';

/** What the Root gives its parts. */
export interface MenuContextValue {
  /** The SSR-stable id of the menu. */
  readonly id: string;
  /** The open model. */
  readonly open: boolean;
  /** Whether the content is in the document: open, or closed with its exit animation running. */
  readonly mounted: boolean;
  /** Whether the content must be rendered: open, or closed with its exit animation still running. */
  readonly keepMounted: boolean;
  /** The trigger element, `null` until it is attached. */
  readonly trigger: HTMLElement | null;
  /** The keys of the mounted items in DOM order; the first one is the tab stop when the active item is gone. */
  readonly keys: readonly string[];
  /** The key of the item that has or last had focus. */
  readonly activeKey: string | undefined;
  /** The type-to-find buffer of the menu. */
  readonly typeahead: Typeahead;
  /** The `id` the author gave the trigger, `undefined` when the machine generates it. */
  readonly triggerId: string | undefined;
  /** Reports the author's trigger id; the Trigger calls it. */
  readonly setTriggerId: (id: string | undefined) => void;
  /** Registers the trigger element; the Trigger puts it in its ref. */
  readonly setTrigger: (element: HTMLElement | null) => void;
  /** Reports whether the content is in the document. */
  readonly setMounted: (mounted: boolean) => void;
  /** The content element, for the exit animation and the focus moves. */
  readonly contentRef: RefObject<HTMLElement | null>;
  /** Registers an item element under its key; the returned function removes it. */
  readonly registerItem: (key: string, element: HTMLElement) => () => void;
  /** The mounted items in DOM order, with the text and the disabled state read from the elements. */
  readonly getEntries: () => readonly MenuItemEntry[];
  /** The element of an item, `undefined` once it is gone. */
  readonly getItem: (key: string) => HTMLElement | undefined;
  /** Takes the item focus goes to on open, and sets it back to the first item. */
  readonly takeInitialFocus: () => 'first' | 'last';
  /**
   * Sends a machine event. The Root decides the open change and reports it, and runs the focus and press events
   * of the items. `false` when `onOpenChange` canceled the change.
   */
  readonly dispatch: (event: MenuEvent) => boolean;
}

/** The context of the Root. */
export const MenuContext: Context<MenuContextValue | null> = createContext<MenuContextValue | null>(null);

/**
 * Reads the Root's context.
 *
 * @param part - The part that asks, for the error message, such as `Menu.Trigger`.
 * @returns The context.
 * @throws When the part is not inside a `Menu.Root`.
 */
export function useMenuContext(part: string): MenuContextValue {
  const context = useContext(MenuContext);
  if (context === null) throw new Error(`CocoKits: <${part}> must be placed within <Menu.Root>.`);
  return context;
}
