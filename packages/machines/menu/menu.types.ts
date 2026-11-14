import type { OverlayAlign, OverlaySide } from '@cocokits/cdk/positioning';
import type { Typeahead } from '@cocokits/cdk/roving-focus';

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

/** What the adapter knows of one item. */
export interface MenuItemEntry {
  /** The key of the item, unique in the menu. */
  readonly key: string;
  /** Whether the item is disabled. A disabled item stays focusable and never runs. @defaultValue false */
  readonly disabled?: boolean | undefined;
  /** The text typeahead matches against: the visible text of the item. */
  readonly text: string;
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
  /** An item got focus; it becomes the active one. */
  | { readonly type: 'ITEM.FOCUS'; readonly key: string }
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
  /** Always `'menuitem'`. */
  readonly role: 'menuitem';
  /** `0` on the active item, `-1` on every other. */
  readonly tabIndex: 0 | -1;
  /** `'true'` while the item is disabled. */
  readonly 'aria-disabled'?: 'true' | undefined;
  /** Present while the item is disabled. */
  readonly 'data-disabled'?: '' | undefined;
  /** Sends `ITEM.RUN` unless a consumer handler vetoed the click. */
  readonly onClick: (event: Event) => void;
  /** Sends `ITEM.FOCUS`. */
  readonly onFocus: (event: Event) => void;
}

/** What `getMenuProps` returns. The root renders no element, so it has no props. */
export interface MenuParts {
  /** The trigger props. */
  readonly trigger: MenuTriggerProps;
  /** The content props. */
  readonly content: MenuContentProps;
  /** The props of one item, by its entry. */
  readonly item: (entry: MenuItemEntry) => MenuItemProps;
}

/** The part of the menu a key is pressed in. */
export type MenuKeyContext = 'Trigger' | 'Menu' | 'Menu item';

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
  readonly intent: 'native' | 'open-first' | 'open-last' | 'step' | 'edge' | 'typeahead' | 'press' | 'layer';
  /** The `key` of the matching row of the meta keyboard table; with `context` it names the row. */
  readonly row: string;
}
