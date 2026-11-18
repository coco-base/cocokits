import { inject, type ComponentPublicInstance, type ComputedRef, type InjectionKey, type ShallowRef } from 'vue';
import type { MenuEvent, MenuInitialFocus, MenuItemChange, MenuItemKind, MenuState } from '@cocokits/machines/menu';

/** What an item tells the Root about itself. The facts that change are read when used, so a change needs no new registration. */
export interface MenuItemRegistration {
  /** The registration key, unique in the menu. */
  readonly key: string;
  /** The item element. */
  readonly element: HTMLElement;
  /** Whether the item is disabled. */
  readonly disabled: boolean;
  /** What the item is: a plain item, a checkbox item or a radio item. */
  readonly kind: MenuItemKind;
  /** For a checkbox item, whether it is checked; for a radio item, whether its value is the value of its group. */
  readonly checked: boolean | undefined;
  /** For a radio item, the value it sets in its group. */
  readonly value: string | undefined;
  /** Whether a supporting text part is mounted. */
  readonly hasDescription: boolean;
  /** Applies the change a press asks for: a checkbox item toggles, a radio item sets the value of its group. */
  readonly change: (change: MenuItemChange) => void;
}

/** What a MenuRoot, or the content of a submenu, gives its parts. */
export interface MenuContextValue {
  /** The id the part ids derive from (`useId()` of the root or of the submenu). */
  readonly id: string;
  /** Whether the menu is open. */
  readonly open: ComputedRef<boolean>;
  /** Whether the content is in the document: open, or closed with its exit animation still running. */
  readonly mounted: ShallowRef<boolean>;
  /** The trigger element (of a submenu, its sub-trigger); `null` until the trigger mounted. */
  readonly triggerElement: ShallowRef<HTMLElement | null>;
  /** Makes the element of this trigger instance the live `triggerElement`; `null` on unmount. */
  readonly followTrigger: (instance: ComponentPublicInstance | null) => void;
  /** The id of the trigger: the author's, else the generated one. The content is labelled by it. */
  readonly triggerId: ShallowRef<string | undefined>;
  /** The content element; `null` while it is not rendered. */
  readonly contentElement: ShallowRef<HTMLElement | null>;
  /** The machine state: the id, the open state and the registered items. The content adds the placement. */
  readonly state: ComputedRef<MenuState>;
  /** Which item focus goes to on the next open; read once by the content. */
  readonly initial: ShallowRef<MenuInitialFocus>;
  /** The registered items in document order. */
  readonly items: ShallowRef<readonly MenuItemRegistration[]>;
  /** Hands an event of a part to the machine and applies the change it accepts. */
  readonly send: (event: MenuEvent) => void;
  /** Registers (or updates) an item; returns the function that removes it. */
  readonly registerItem: (item: MenuItemRegistration) => () => void;
  /** Tells the open submenus that the pointer moved over the item with this key: all but its own sub-trigger close. */
  readonly pointerMoved: (key: string, event: Event) => void;
  /** Listens for `pointerMoved`; returns the function that stops. */
  readonly onPointerMoved: (listener: (key: string, event: Event) => void) => () => void;
  /** Closes the menu and every menu it is a submenu of: a press on an item. */
  readonly closeAll: (event: Event) => void;
}

/** Injection key of the menu context. Not exported from any entry point. */
export const MENU_KEY: InjectionKey<MenuContextValue> = Symbol('cck-menu');

/** What an item gives the parts inside it. Not exported from any entry point. */
export interface MenuItemContextValue {
  /** The registration key of the item. */
  readonly key: string;
  /** Whether a checkbox or radio item is checked: its indicator shows it. */
  readonly checked: ComputedRef<boolean>;
  /** A supporting text part mounted; returns the function that tells the item it is gone. */
  readonly describe: () => () => void;
}

/** Injection key of the item context. Not exported from any entry point. */
export const MENU_ITEM_KEY: InjectionKey<MenuItemContextValue> = Symbol('cck-menu-item');

/** What a MenuSub gives its sub-trigger and its sub-content. Not exported from any entry point. */
export interface MenuSubContextValue {
  /** The menu the sub-trigger is an item of. */
  readonly parent: MenuContextValue;
  /**
   * The context of the submenu: what its sub-content gives the items inside it, and the one `send` that handles the
   * events of the sub-trigger and of the items. Its `triggerElement` is the sub-trigger.
   */
  readonly menu: MenuContextValue;
  /** The registration key of the sub-trigger in the parent menu; `undefined` until it mounted. */
  readonly triggerKey: ShallowRef<string | undefined>;
  /** Whether the sub-trigger is disabled: it never opens the submenu. */
  readonly triggerDisabled: ShallowRef<boolean>;
  /** The item focus goes to when a key opened the submenu; `null` for a pointer or a click, which leave focus where it is. */
  readonly focusRequest: ShallowRef<MenuInitialFocus | null>;
}

/** Injection key of the submenu context. Not exported from any entry point. */
export const MENU_SUB_KEY: InjectionKey<MenuSubContextValue> = Symbol('cck-menu-sub');

/**
 * The context of the nearest MenuSub.
 *
 * @param part - The name of the calling part, for the error.
 * @returns The context.
 * @throws When the part is used outside a MenuSub.
 */
export function useMenuSubContext(part: string): MenuSubContextValue {
  const context = inject(MENU_SUB_KEY, undefined);
  if (!context) throw new Error(`CocoKits: <${part}> must be used inside <MenuSub>.`);
  return context;
}

/** What a group or a radio group gives its label. Not exported from any entry point. */
export interface MenuGroupContextValue {
  /** The id of the group; the id of its label derives from it. */
  readonly id: string;
  /** A label mounted; returns the function that tells the group it is gone. */
  readonly label: () => () => void;
}

/** Injection key of the group context. Not exported from any entry point. */
export const MENU_GROUP_KEY: InjectionKey<MenuGroupContextValue> = Symbol('cck-menu-group');

/** What a radio group gives its radio items. Not exported from any entry point. */
export interface MenuRadioGroupContextValue {
  /** The value of the checked radio item. */
  readonly value: ComputedRef<string | null | undefined>;
  /** Sets the value: the user pressed a radio item. */
  readonly set: (value: string) => void;
}

/** Injection key of the radio group context. Not exported from any entry point. */
export const MENU_RADIO_GROUP_KEY: InjectionKey<MenuRadioGroupContextValue> = Symbol('cck-menu-radio-group');

/**
 * The context of the nearest MenuRoot, or of the content of the nearest submenu.
 *
 * @param part - The name of the calling part, for the error.
 * @returns The context.
 * @throws When the part is used outside a MenuRoot.
 */
export function useMenuContext(part: string): MenuContextValue {
  const context = inject(MENU_KEY, undefined);
  if (!context) throw new Error(`CocoKits: <${part}> must be used inside <MenuRoot>.`);
  return context;
}
