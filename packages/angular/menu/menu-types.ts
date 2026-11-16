import type { Signal } from '@angular/core';
import type { MenuAlign, MenuChangeReason, MenuItemChange, MenuItemKind, MenuSide } from '@cocokits/machines/menu';
import type { ChangeDetails } from '@cocokits/shared';

/** What the content part tells the menu about itself. @internal */
export interface MenuContentRegistration {
  /** The content element, in the portal host. */
  readonly element: HTMLElement;
  /** The wanted side. */
  readonly side: Signal<MenuSide>;
  /** The wanted alignment. */
  readonly align: Signal<MenuAlign>;
  /** The gap to the trigger in px, when the author set one; else the theme's `--side-offset`. */
  readonly sideOffset: Signal<number | undefined>;
  /** The shift along the trigger edge in px, when the author set one. */
  readonly alignOffset: Signal<number | undefined>;
  /** Whether the author named the content with `aria-label` or `aria-labelledby`. */
  readonly named: Signal<boolean>;
  /** Whether the content has rendered once, so it has its class and theme attributes: only then it is positioned. */
  readonly ready: Signal<boolean>;
}

/** What an item part tells the menu about itself. @internal */
export interface MenuItemRegistration {
  /** The key of the item, unique in the menu. */
  readonly key: string;
  /** The item element. */
  readonly element: HTMLElement;
  /** Whether the item is disabled. */
  readonly disabled: Signal<boolean>;
  /** What the item is. */
  readonly kind: Signal<MenuItemKind>;
  /** For a checkbox item whether it is checked; for a radio item whether its value is the group's. */
  readonly checked: Signal<boolean>;
  /** For a radio item, the value it sets. */
  readonly value: Signal<string | undefined>;
  /** Whether a supporting text is mounted in the item. */
  readonly hasDescription: Signal<boolean>;
  /** Applies the change a press asks for. */
  readonly apply: (change: MenuItemChange, event: Event) => void;
}

/** What a parent menu asks of its submenus. @internal */
export interface MenuSubHandle {
  /** The pointer moved over another item of the parent: an open submenu closes. */
  _pointerLeft(event: Event): void;
}

/** Why the open state of a Menu changed. */
export type MenuOpenChangeReason = MenuChangeReason;

/** What `opened`, `closed` and `closePredicate` receive: the `reason` of the change and the `event` behind it. */
export type MenuChangeDetails = ChangeDetails<MenuOpenChangeReason>;
