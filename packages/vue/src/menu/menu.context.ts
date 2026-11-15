import { inject, type ComponentPublicInstance, type ComputedRef, type InjectionKey, type ShallowRef } from 'vue';
import type { MenuEvent, MenuInitialFocus, MenuState } from '@cocokits/machines/menu';

/** What an item tells the Root about itself. */
export interface MenuItemRegistration {
  /** The registration key, unique in the menu. */
  readonly key: string;
  /** The item element. */
  readonly element: HTMLElement;
  /** Whether the item is disabled. */
  readonly disabled: boolean;
}

/** What a MenuRoot gives its parts. */
export interface MenuContextValue {
  /** The id the part ids derive from (`useId()` of the root). */
  readonly id: string;
  /** Whether the menu is open. */
  readonly open: ComputedRef<boolean>;
  /** Whether the content is in the document: open, or closed with its exit animation still running. */
  readonly mounted: ShallowRef<boolean>;
  /** The trigger element; `null` until the trigger mounted. */
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
}

/** Injection key of the menu context. Not exported from any entry point. */
export const MENU_KEY: InjectionKey<MenuContextValue> = Symbol('cck-menu');

/**
 * The context of the nearest MenuRoot.
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
