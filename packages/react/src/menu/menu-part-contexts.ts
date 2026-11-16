'use client';

import { createContext, useContext, type Context } from 'react';
import type { MenuEvent, MenuSubChangeReason } from '@cocokits/machines/menu';
import type { MenuContextValue } from './menu-context';

/** What an item gives the parts inside it: its key, whether it is checked and how to say it has a supporting text. */
export interface MenuItemContextValue {
  /** The key of the item, unique in its menu. */
  readonly key: string;
  /** Whether a checkbox or radio item is checked; `false` for a plain item. */
  readonly checked: boolean;
  /** Tells the item a supporting text is mounted; returns the function that tells it the text is gone. */
  readonly registerDescription: () => () => void;
}

/** The context of an item; `null` outside an item. */
export const MenuItemContext: Context<MenuItemContextValue | null> = createContext<MenuItemContextValue | null>(null);

/** What a group gives its label: the id of the group, and how to say a label is mounted. */
export interface MenuGroupContextValue {
  /** The SSR-stable id of the group; the label id derives from it. */
  readonly id: string;
  /** Tells the group a label is mounted; returns the function that tells it the label is gone. */
  readonly registerLabel: () => () => void;
}

/** The context of a group or a radio group; `null` outside one. */
export const MenuGroupContext: Context<MenuGroupContextValue | null> = createContext<MenuGroupContextValue | null>(
  null,
);

/** What a radio group gives its radio items. */
export interface MenuRadioGroupContextValue {
  /** The value of the checked radio item, `undefined` while none is checked. */
  readonly value: string | undefined;
  /** Sets the value after a user press and reports it. */
  readonly setValue: (value: string, event: Event | null) => void;
}

/** The context of a radio group; `null` outside one. */
export const MenuRadioGroupContext: Context<MenuRadioGroupContextValue | null> =
  createContext<MenuRadioGroupContextValue | null>(null);

/** What a `Menu.Sub` gives its sub-trigger and its sub-content. */
export interface MenuSubContextValue {
  /** The SSR-stable id of the submenu. */
  readonly id: string;
  /** The key the sub-trigger registers under in the parent menu. */
  readonly triggerKey: string;
  /** The open model of the submenu. */
  readonly open: boolean;
  /** Whether the sub-content is in the document: open, or closed with its exit animation running. */
  readonly mounted: boolean;
  /** The `id` the author gave the sub-trigger, `undefined` when the machine generates it. */
  readonly triggerId: string | undefined;
  /** Reports the author's sub-trigger id. */
  readonly setTriggerId: (id: string | undefined) => void;
  /** Registers the sub-trigger element. */
  readonly setTrigger: (element: HTMLElement | null) => void;
  /** Reports whether the sub-trigger is disabled. */
  readonly setTriggerDisabled: (disabled: boolean) => void;
  /** Sends an event about the submenu: the sub-trigger and the sub-content call it. */
  readonly dispatch: (event: MenuEvent) => boolean;
  /** Cancels an open that waits for the pointer to rest. */
  readonly cancelPending: () => void;
  /** The context the items of the submenu read. */
  readonly menu: MenuContextValue;
}

/** The context of a `Menu.Sub`; `null` outside one. */
export const MenuSubContext: Context<MenuSubContextValue | null> = createContext<MenuSubContextValue | null>(null);

/** Why the submenu changed; re-exported for the part types. */
export type { MenuSubChangeReason };

/**
 * Reads the item of a part inside an item.
 *
 * @param part - The part that asks, for the error message.
 * @returns The item context.
 * @throws When the part is not inside a menu item.
 */
export function useMenuItemContext(part: string): MenuItemContextValue {
  const context = useContext(MenuItemContext);
  if (context === null) {
    throw new Error(`CocoKits: <${part}> must be placed within <Menu.Item>, <Menu.CheckboxItem> or <Menu.RadioItem>.`);
  }
  return context;
}

/**
 * Reads the Sub of a sub-trigger or a sub-content.
 *
 * @param part - The part that asks, for the error message.
 * @returns The sub context.
 * @throws When the part is not inside a `Menu.Sub`.
 */
export function useMenuSubContext(part: string): MenuSubContextValue {
  const context = useContext(MenuSubContext);
  if (context === null) throw new Error(`CocoKits: <${part}> must be placed within <Menu.Sub>.`);
  return context;
}
