import type { OverlayAlign, OverlaySide } from '@cocokits/cdk/positioning';
import type { Typeahead } from '@cocokits/cdk/roving-focus';
import type { Direction } from '@cocokits/shared';
import type { MenuItemContentParts } from './menu-parts.types';
import type { MenuSubEvent, MenuSubState, MenuSubTriggerProps } from './menu-sub.types';

/**
 * Why the menu opened or closed.
 *
 * @cckValue trigger - The user pressed the trigger.
 * @cckValue item - An item ran.
 * @cckValue escape - The user pressed Escape.
 * @cckValue outside-press - The user pressed outside the menu.
 * @cckValue focus-out - The focus left the menu (Tab, Shift+Tab or any other focus move).
 */
export type MenuChangeReason = 'trigger' | 'item' | 'escape' | 'outside-press' | 'focus-out';

/** The side of the trigger the content sits on. `start` and `end` follow the direction. */
export type MenuSide = OverlaySide;

/** How the content lines up along the trigger's edge. */
export type MenuAlign = OverlayAlign;

/**
 * What an item is. A plain item runs an action; a checkbox item toggles a state; a radio item sets the value of its
 * radio group.
 *
 * @cckValue item - Runs an action.
 * @cckValue checkbox - Toggles its `checked` state.
 * @cckValue radio - Sets the value of its radio group.
 */
export type MenuItemKind = 'item' | 'checkbox' | 'radio';

/**
 * Why the state of a checkbox item or the value of a radio group changed.
 *
 * @cckValue user - The user pressed the item.
 */
export type MenuItemChangeReason = 'user';

/** What a press on a checkbox or radio item asks for. */
export type MenuItemChange =
  | {
      readonly type: 'checkbox';
      /** The key of the item. */
      readonly key: string;
      /** The new checked state. */
      readonly checked: boolean;
      /** Why. */
      readonly reason: MenuItemChangeReason;
    }
  | {
      readonly type: 'radio';
      /** The key of the item. */
      readonly key: string;
      /** The value the radio group takes. */
      readonly value: string;
      /** Why. */
      readonly reason: MenuItemChangeReason;
    };

/** What the adapter knows of one item. */
export interface MenuItemEntry {
  /** The key of the item, unique in the menu. */
  readonly key: string;
  /** Whether the item is disabled. A disabled item stays focusable and never runs. @defaultValue false */
  readonly disabled?: boolean | undefined;
  /** The text typeahead matches against: the visible text of the item. */
  readonly text: string;
  /** What the item is. @defaultValue 'item' */
  readonly kind?: MenuItemKind | undefined;
  /** For a checkbox item, whether it is checked; for a radio item, whether its value is the value of its group. @defaultValue false */
  readonly checked?: boolean | undefined;
  /** For a radio item, the value it sets in its group. */
  readonly value?: string | undefined;
  /** Whether a supporting text part is mounted; the item is described by it. @defaultValue false */
  readonly hasDescription?: boolean | undefined;
}

/** Inputs of `getMenuProps`, `transitionMenu` and the key handlers. */
export interface MenuState {
  /** The SSR-stable id of the menu, from the adapter. */
  readonly id: string;
  /** The open model. */
  readonly open: boolean;
  /**
   * Whether the content is in the document: `open`, or closed with an exit animation still running.
   * @defaultValue the value of `open`
   */
  readonly mounted?: boolean | undefined;
  /** The resolved side, from the adapter's placement state. @defaultValue 'bottom' */
  readonly side?: MenuSide | undefined;
  /** The resolved alignment, from the adapter's placement state. @defaultValue 'start' */
  readonly align?: MenuAlign | undefined;
  /** The id the trigger renders: the author's. @defaultValue the generated `<id>-trigger` */
  readonly triggerId?: string | undefined;
  /** The mounted items in DOM order. @defaultValue [] */
  readonly items?: readonly MenuItemEntry[] | undefined;
  /**
   * The key of the active item: the one that has or last had focus. When it is not among the items, the first
   * item is the active one.
   */
  readonly activeKey?: string | undefined;
  /** Whether the author named the content with `aria-label` or `aria-labelledby`; the trigger then does not. @defaultValue false */
  readonly named?: boolean | undefined;
  /** The type-to-find buffer of the menu, from the adapter. Without it typeahead is off. */
  readonly typeahead?: Typeahead | undefined;
  /** The text direction from the direction runtime; it flips the keys that open and close a submenu. @defaultValue 'ltr' */
  readonly dir?: Direction | undefined;
  /**
   * This menu is a submenu: its content takes the sub-content class and `ArrowLeft` (`ArrowRight` in rtl) closes
   * it. Set `triggerId` to the id of the sub-trigger, which names the content. @defaultValue false
   */
  readonly sub?: boolean | undefined;
}

/** Which item focus goes to when the menu opens. */
export type MenuInitialFocus = 'first' | 'last';

/** The events the handlers send. */
export type MenuEvent =
  | { readonly type: 'TRIGGER.CLICK'; readonly event: Event }
  | { readonly type: 'TRIGGER.OPEN'; readonly initial: MenuInitialFocus; readonly event: Event }
  /** The layer stack or a focus guard asked the menu to close. */
  | {
      readonly type: 'CONTENT.DISMISS';
      readonly reason: 'escape' | 'outside-press' | 'focus-out';
      readonly event: Event | null;
    }
  /** An item was clicked. The adapter runs the item event first and sets `prevented` from it. */
  | {
      readonly type: 'ITEM.RUN';
      readonly key: string;
      readonly disabled: boolean;
      readonly prevented?: boolean | undefined;
      readonly event: Event;
    }
  /** Enter or Space on the active item: the adapter clicks its element. Never sent for a disabled item. */
  | { readonly type: 'ITEM.PRESS'; readonly key: string; readonly event: Event }
  /** Space on a checkbox or radio item: the adapter applies {@link MenuItemChange} and keeps the menu open. Never sent for a disabled item. */
  | { readonly type: 'ITEM.CHECK'; readonly key: string; readonly event: Event }
  /** The pointer moved over an item: close an open submenu of the parent with `SUB.PARENT.POINTER_MOVE`. */
  | { readonly type: 'ITEM.POINTER_MOVE'; readonly key: string; readonly event: Event }
  /** An item got focus; it becomes the active one. */
  | { readonly type: 'ITEM.FOCUS'; readonly key: string }
  /** An event about a submenu: pass it to `transitionMenuSub`, not to `transitionMenu`. */
  | MenuSubEvent
  /** A key moved to an item: the adapter focuses its element. */
  | { readonly type: 'CONTENT.MOVE'; readonly key: string; readonly event: Event };

/** The open change the adapter reports (when the model accepts it). */
export interface MenuTransition {
  /** The requested open state. */
  readonly open: boolean;
  /** Why. */
  readonly reason: MenuChangeReason;
  /** The item focus goes to when the change opens the menu. */
  readonly initial?: MenuInitialFocus | undefined;
}

/** The ids of the parts that link to each other. */
export interface MenuIds {
  /** The trigger id. */
  readonly trigger: string;
  /** The content id. */
  readonly content: string;
}

/** Props shared by every part. */
export interface MenuPartProps {
  /** The part's class from the anatomy. */
  readonly class: string;
}

/** Props of the trigger. */
export interface MenuTriggerProps extends MenuPartProps {
  /** The trigger id. */
  readonly id: string;
  /** Always `'button'`. */
  readonly type: 'button';
  /** Always `'menu'`. */
  readonly 'aria-haspopup': 'menu';
  /** The open state, always rendered. */
  readonly 'aria-expanded': 'true' | 'false';
  /** The content id, only while the content is mounted. */
  readonly 'aria-controls'?: string | undefined;
  /** `open` or `closed`. */
  readonly 'data-state': 'open' | 'closed';
  /** Sends `TRIGGER.CLICK` unless a consumer handler vetoed the click. */
  readonly onClick: (event: Event) => void;
  /** Sends `TRIGGER.OPEN` for ArrowDown and ArrowUp while the menu is closed. */
  readonly onKeyDown: (event: KeyboardEvent) => void;
}

/** Props of the content. */
export interface MenuContentProps extends MenuPartProps {
  /** The content id. */
  readonly id: string;
  /** Always `'menu'`. */
  readonly role: 'menu';
  /** Always `-1`: the content takes focus when it holds no item, and is never a tab stop. */
  readonly tabIndex: -1;
  /** The trigger id, unless the author named the content. */
  readonly 'aria-labelledby'?: string | undefined;
  /** `open`, or `closed` while the content exits. */
  readonly 'data-state': 'open' | 'closed';
  /** The resolved side. */
  readonly 'data-side': MenuSide;
  /** The resolved alignment. */
  readonly 'data-align': MenuAlign;
  /** Moves between items, types ahead and presses the active item. */
  readonly onKeyDown: (event: KeyboardEvent) => void;
}

/** Props of one item. */
export interface MenuItemProps extends MenuPartProps {
  /** `menuitem`; `menuitemcheckbox` and `menuitemradio` for a checkbox and a radio item. */
  readonly role: 'menuitem' | 'menuitemcheckbox' | 'menuitemradio';
  /** `0` on the active item, `-1` on every other. */
  readonly tabIndex: 0 | -1;
  /** `'true'` or `'false'` on a checkbox and a radio item; absent on a plain item. */
  readonly 'aria-checked'?: 'true' | 'false' | undefined;
  /** `'true'` while the item is disabled. */
  readonly 'aria-disabled'?: 'true' | undefined;
  /** The id of the supporting text, only while the item has one. */
  readonly 'aria-describedby'?: string | undefined;
  /** `checked` or `unchecked` on a checkbox and a radio item; absent on a plain item. */
  readonly 'data-state'?: 'checked' | 'unchecked' | undefined;
  /** Present while the item is disabled. */
  readonly 'data-disabled'?: '' | undefined;
  /** Present on a checkbox or radio item while it is the active item of an open menu. */
  readonly 'data-highlighted'?: '' | undefined;
  /** Sends `ITEM.POINTER_MOVE`. */
  readonly onPointerMove: (event: Event) => void;
  /** Sends `ITEM.RUN` unless a consumer handler vetoed the click. */
  readonly onClick: (event: Event) => void;
  /** Sends `ITEM.FOCUS`. */
  readonly onFocus: (event: Event) => void;
  /** Enter and Space press the item; a disabled item only holds the default action. */
  readonly onKeyDown: (event: KeyboardEvent) => void;
}

/** What `getMenuProps` returns. The root renders no element, so it has no props. */
export interface MenuParts extends MenuItemContentParts {
  /** The trigger props. */
  readonly trigger: MenuTriggerProps;
  /** The content props. */
  readonly content: MenuContentProps;
  /** The props of one item, by its entry: a plain, a checkbox or a radio item. */
  readonly item: (entry: MenuItemEntry) => MenuItemProps;
  /**
   * The props of the sub-trigger, an item of this menu that opens a submenu. Its events go to `send`: the `SUB.*`
   * ones to `transitionMenuSub`, `ITEM.FOCUS` to `transitionMenu`.
   */
  readonly subTrigger: (entry: MenuItemEntry, sub: MenuSubState) => MenuSubTriggerProps;
}

/** The part of the menu a key is pressed in. */
export type MenuKeyContext =
  'Trigger' | 'Menu' | 'Menu item' | 'Menu checkbox or radio item' | 'Sub-trigger' | 'Submenu';

/** One handled key of the keymap. */
export interface MenuKeyBinding {
  /** `KeyboardEvent.key` values; empty for `typeahead`, which is any single printable character. */
  readonly keys: readonly string[];
  /** Whether Shift must be held (`'yes'`), must not (`'no'`) or may be (`'either'`). */
  readonly shift: 'yes' | 'no' | 'either';
  /** Where the key is pressed. */
  readonly context: MenuKeyContext;
  /**
   * What the key does. `native` and `layer` rows are not handled by the key handlers: the browser clicks a
   * button for Enter and Space, and the dismissal stack and the focus guards close the menu for Escape and Tab.
   */
  readonly intent:
    | 'native'
    | 'open-first'
    | 'open-last'
    | 'step'
    | 'edge'
    | 'typeahead'
    | 'press'
    | 'check'
    | 'open-sub'
    | 'close-sub'
    | 'layer';
  /** The `key` of the matching row of the meta keyboard table; with `context` it names the row. */
  readonly row: string;
}
