/**
 * Why a submenu opened or closed.
 *
 * @cckValue trigger - The user pressed the sub-trigger.
 * @cckValue key - A key opened it (ArrowRight, Enter or Space on the sub-trigger), or closed it (ArrowLeft in it).
 * @cckValue pointer - The pointer rested on the sub-trigger, or moved to another item of the parent menu.
 * @cckValue escape - The user pressed Escape inside it.
 * @cckValue outside-press - The user pressed outside the menu.
 */
export type MenuSubChangeReason = 'trigger' | 'key' | 'pointer' | 'escape' | 'outside-press';

/** What the adapter knows of one submenu. */
export interface MenuSubState {
  /** The SSR-stable id of the submenu, from the adapter. The content id derives from it. */
  readonly id: string;
  /** The open model of the submenu. */
  readonly open: boolean;
  /**
   * Whether the sub-content is in the document: `open`, or closed with an exit animation still running.
   * @defaultValue the value of `open`
   */
  readonly mounted?: boolean | undefined;
  /** The id the sub-trigger renders. @defaultValue the generated `<id>-trigger` */
  readonly triggerId?: string | undefined;
}

/** What `transitionMenuSub` reads of a submenu: whether it is open and whether its sub-trigger is disabled. */
export type MenuSubTransitionState = Pick<MenuSubState, 'open'> & { readonly disabled?: boolean | undefined };

/** The events the sub-trigger and the parent menu send about a submenu. */
export type MenuSubEvent =
  /** The sub-trigger was clicked. */
  | { readonly type: 'SUB.TRIGGER.CLICK'; readonly event: Event }
  /** A key on the sub-trigger opened it; focus goes to the first or last item. */
  | { readonly type: 'SUB.TRIGGER.OPEN'; readonly initial: 'first' | 'last'; readonly event: Event }
  /** The pointer moved over the sub-trigger; the adapter waits for `delay` and applies the result only if the pointer stayed. */
  | { readonly type: 'SUB.TRIGGER.POINTER_MOVE'; readonly event: Event }
  /** The pointer moved to another item of the parent menu. */
  | { readonly type: 'SUB.PARENT.POINTER_MOVE'; readonly event: Event }
  /** ArrowLeft (ArrowRight in rtl) was pressed in the submenu. */
  | { readonly type: 'SUB.CLOSE'; readonly event: Event }
  /** The layer stack asked the submenu to close. */
  | {
      readonly type: 'SUB.DISMISS';
      readonly reason: 'escape' | 'outside-press';
      readonly event: Event | null;
    };

/** The open change of a submenu the adapter reports. */
export interface MenuSubTransition {
  /** The requested open state. */
  readonly open: boolean;
  /** Why. */
  readonly reason: MenuSubChangeReason;
  /** The item focus goes to when the change opens the submenu; absent for a pointer or a click, which leave focus where it is. */
  readonly initial?: 'first' | 'last' | undefined;
  /** Focus returns to the sub-trigger: a key or Escape closed the submenu. */
  readonly focus?: 'trigger' | undefined;
  /** The wait in milliseconds before the adapter applies the change; cancel it on any later event. */
  readonly delay?: number | undefined;
}

/** Where the sub-content goes: its top-start corner at the bottom-end corner of the sub-trigger. */
export interface MenuSubPlacement {
  /** The side of the sub-trigger the content is placed on first. */
  readonly side: 'bottom';
  /** The alignment: the content starts at the start edge of the sub-trigger and is then moved by `alignOffset`. */
  readonly align: 'start';
  /** The width of the sub-trigger in px: it moves the start edge of the content to the end edge of the sub-trigger. */
  readonly alignOffset: number;
  /** The sides the content flips to, in order, when there is no room below: before the sub-trigger, then above it. */
  readonly fallbackSides: readonly ['start', 'top'];
}

/** Props of the sub-trigger, an item of the parent menu that opens a submenu. Absent keys are `undefined`. */
export interface MenuSubTriggerProps {
  /** The `cck-menu__sub-trigger` class. */
  readonly class: string;
  /** The sub-trigger id. */
  readonly id: string;
  /** Always `'menuitem'`. */
  readonly role: 'menuitem';
  /** `0` on the active item of the parent menu, `-1` on every other. */
  readonly tabIndex: 0 | -1;
  /** Always `'menu'`. */
  readonly 'aria-haspopup': 'menu';
  /** The open state, always rendered. */
  readonly 'aria-expanded': 'true' | 'false';
  /** The sub-content id, only while it is mounted. */
  readonly 'aria-controls'?: string | undefined;
  /** `'true'` while the sub-trigger is disabled. */
  readonly 'aria-disabled'?: 'true' | undefined;
  /** `open` or `closed`. */
  readonly 'data-state': 'open' | 'closed';
  /** Present while the sub-trigger is disabled. */
  readonly 'data-disabled'?: '' | undefined;
  /** Present while the sub-trigger is the active item of an open parent menu. */
  readonly 'data-highlighted'?: '' | undefined;
  /** Sends `SUB.TRIGGER.CLICK`, and stops the click from running the parent item. */
  readonly onClick: (event: Event) => void;
  /** Sends `SUB.TRIGGER.POINTER_MOVE`. */
  readonly onPointerMove: (event: Event) => void;
  /** Sends `ITEM.FOCUS` to the parent menu, so the sub-trigger becomes its active item. */
  readonly onFocus: (event: Event) => void;
  /** Opens with ArrowRight (ArrowLeft in rtl), Enter and Space. */
  readonly onKeyDown: (event: KeyboardEvent) => void;
}
