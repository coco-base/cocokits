import type { Direction } from '@cocokits/shared';
import { containsDeep, sortByDomOrder } from '@cocokits/utils';
import { computedDirection } from '../direction';
import { resolveNextIndex } from './resolve-next-index';
import type { RovingItem, RovingOrientation } from './resolve-next-index';
import { createTypeahead } from './typeahead';

/** Options of {@link createRovingFocus}. */
export interface RovingFocusOptions {
  /** Returns the items. It is read on every key press. The items are put into DOM order, and every index refers to that order. */
  readonly getItems: () => readonly RovingItem[];
  /**
   * How the active item is shown.
   * Use `'focus'` for a tab list, a radio group or a menu, and `'active-descendant'` for a list box.
   *
   * @cckValue focus - Moves DOM focus to the item.
   * @cckValue active-descendant - Only reports the index, and focus stays on the widget.
   */
  readonly strategy: 'focus' | 'active-descendant';
  /**
   * Which arrow keys move through the items.
   * @defaultValue 'both'
   */
  readonly orientation?: RovingOrientation | undefined;
  /**
   * Whether the arrows wrap around.
   * @defaultValue false
   */
  readonly loop?: boolean | undefined;
  /**
   * Returns the text direction of the widget. It flips the horizontal arrows.
   * @defaultValue The computed `direction` of the item that gets the key. It sees a `dir` attribute on an ancestor.
   */
  readonly getDirection?: (() => Direction) | undefined;
  /** Returns the current index. It is read for `'active-descendant'`, and for `'focus'` when the event target is not an item. */
  readonly getCurrentIndex: () => number;
  /** Called when a key moves to another item, with the new index and the reason (`'keyboard'` or `'typeahead'`). Update your state here. */
  readonly onActiveChange: (index: number, details: { reason: 'keyboard' | 'typeahead'; event: Event }) => void;
  /**
   * Whether printable keys move to the item whose text starts with what the user types.
   * @defaultValue false
   */
  readonly typeahead?: boolean | undefined;
  /** The number of items that PageUp and PageDown move. When not set, both keys are not handled. */
  readonly pageSize?: number | undefined;
}

/** The keyboard handler of a widget with many items, where one item is the tab stop. */
export interface RovingFocus {
  /**
   * Handles one `keydown`. Events that are default-prevented, composing, or carry Ctrl, Meta or Alt are not handled.
   *
   * @param event - The keyboard event.
   * @returns `true` when the key moved to an item, or typed to one, and the event was default-prevented.
   * @example
   * list.addEventListener('keydown', (event) => roving.handleKeyDown(event));
   */
  handleKeyDown(event: KeyboardEvent): boolean;
  /** Clears the typeahead buffer. After this, `handleKeyDown` returns `false`. */
  destroy(): void;
}

/** The items sorted by the position of their elements in the document. */
function inDomOrder(items: readonly RovingItem[]): RovingItem[] {
  const byElement = new Map(items.map((item) => [item.element, item]));
  return sortByDomOrder([...byElement.keys()]).flatMap((element) => byElement.get(element) ?? []);
}

/** The computed direction at the element that gets the key; `'ltr'` when there is no element. */
function directionAt(target: EventTarget | null): Direction {
  // `nodeType === 1` is `Node.ELEMENT_NODE`, written as a number so the module needs no `Node` global.
  return (target as Node | null)?.nodeType === 1 ? computedDirection(target as Element) : 'ltr';
}

/**
 * Creates the arrow-key navigation of a widget with many items, such as a tab list, a menu or a list box.
 * Arrow keys, Home and End move to the next enabled item.
 *
 * @remarks
 * You attach `handleKeyDown` to the element you want, such as the list or the trigger. You own the tab
 * stop, see {@link resolveTabStop}, and you update your state from `onActiveChange`.
 *
 * With the `'focus'` strategy, the current index is the item that holds the event target. Pointer focus and
 * code focus never leave a stale state.
 *
 * Only `getItems`, `strategy`, `getCurrentIndex` and `onActiveChange` are required. Without `orientation`, both arrow
 * axes move. Without `loop`, the arrows stop at the ends. Without `getDirection`, the text direction is read from the
 * item that gets the key.
 *
 * @param options - The items, the strategy and the callbacks.
 * @returns The handler. Call `destroy()` when you are done.
 * @example
 * const items = [...document.querySelectorAll<HTMLElement>('[role="tab"]')];
 * let current = 0;
 * const roving = createRovingFocus({
 *   getItems: () => items.map((element) => ({ element, disabled: false })),
 *   strategy: 'focus',
 *   getCurrentIndex: () => current,
 *   onActiveChange: (index) => {
 *     current = index;
 *   },
 * });
 * document.querySelector('[role="tablist"]')!.addEventListener('keydown', (event) => {
 *   roving.handleKeyDown(event as KeyboardEvent);
 * });
 * // When you are done:
 * roving.destroy();
 */
export function createRovingFocus(options: RovingFocusOptions): RovingFocus {
  const typeahead = options.typeahead ? createTypeahead() : undefined;
  let destroyed = false;

  const currentIndex = (items: readonly RovingItem[], event: KeyboardEvent): number => {
    if (options.strategy === 'focus') {
      const target = (event.composedPath()[0] ?? event.target) as Node | null;
      const index = items.findIndex((item) => containsDeep(item.element, target));
      if (index >= 0) return index;
    }
    return options.getCurrentIndex();
  };

  const move = (
    items: readonly RovingItem[],
    next: number,
    current: number,
    reason: 'keyboard' | 'typeahead',
    event: KeyboardEvent,
  ): void => {
    event.preventDefault();
    if (next === current) return;
    if (options.strategy === 'focus') items[next]?.element.focus();
    options.onActiveChange(next, { reason, event });
  };

  return {
    handleKeyDown(event) {
      if (destroyed || event.defaultPrevented || event.isComposing) return false;
      if (event.ctrlKey || event.metaKey || event.altKey) return false;
      const items = inDomOrder(options.getItems());
      const current = currentIndex(items, event);

      if (typeahead && event.key.length === 1) {
        const index = typeahead.match(
          event.key,
          items.map((item) => ({ disabled: item.disabled, text: item.text ?? item.element.textContent })),
          current,
        );
        if (index === null) return false;
        move(items, index, current, 'typeahead', event);
        return true;
      }

      const next = resolveNextIndex({
        key: event.key,
        count: items.length,
        current,
        isDisabled: (index) => items[index]?.disabled ?? true,
        orientation: options.orientation,
        loop: options.loop,
        dir: options.getDirection?.() ?? directionAt(items[current]?.element ?? event.target),
        pageSize: options.pageSize,
      });
      if (next === null) return false;
      move(items, next, current, 'keyboard', event);
      return true;
    },
    destroy() {
      destroyed = true;
      typeahead?.reset();
    },
  };
}
