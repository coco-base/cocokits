import type { Direction } from '@cocokits/shared';
import { containsDeep, sortByDomOrder } from '@cocokits/utils';
import { resolveNextIndex } from './resolve-next-index';
import type { RovingItem, RovingOrientation } from './resolve-next-index';
import { createTypeahead } from './typeahead';

/** Options of {@link createRovingFocus}. */
export interface RovingFocusOptions {
  /** The items, read on every key press. They are put into DOM order here, and every index below refers to that order. */
  readonly getItems: () => readonly RovingItem[];
  /**
   * `focus` moves DOM focus to the item (tabs, radio group, menu, accordion headers);
   * `active-descendant` only reports the index and focus stays on the widget (select, combobox list).
   */
  readonly strategy: 'focus' | 'active-descendant';
  readonly orientation: RovingOrientation;
  /** Whether the arrows wrap around. */
  readonly loop: boolean;
  /** The direction from the adapter's direction runtime, never `document.dir`. */
  readonly getDirection: () => Direction;
  /** The current index; read for `active-descendant` and when the event target is not an item. */
  readonly getCurrentIndex: () => number;
  /** Called when a key moves to another item. */
  readonly onActiveChange: (index: number, details: { reason: 'keyboard' | 'typeahead'; event: Event }) => void;
  /** Type-to-find on printable keys. @defaultValue false */
  readonly typeahead?: boolean | undefined;
  /** The step of PageUp and PageDown; unhandled when omitted. */
  readonly pageSize?: number | undefined;
}

/** The keyboard handler of a composite widget. */
export interface RovingFocus {
  /**
   * Handles one `keydown`. Returns `true` when it moved (or typed to) an item and called
   * `preventDefault()`. Events that are default-prevented, composing, or carry Ctrl, Meta or Alt are
   * not handled.
   */
  handleKeyDown(event: KeyboardEvent): boolean;
  /** Clears the typeahead buffer. After it, `handleKeyDown` returns `false`. */
  destroy(): void;
}

/** The items sorted by the position of their elements in the document. */
function inDomOrder(items: readonly RovingItem[]): RovingItem[] {
  const byElement = new Map(items.map((item) => [item.element, item]));
  return sortByDomOrder([...byElement.keys()]).flatMap((element) => byElement.get(element) ?? []);
}

/**
 * Creates the roving keyboard navigation of one widget. The caller attaches `handleKeyDown` where it
 * wants (the list, the trigger), owns the tab stop (see `resolveTabStop`) and updates its state from
 * `onActiveChange`. Under the `focus` strategy the current index is the item that holds the event
 * target, so pointer and programmatic focus never leave stale state.
 *
 * @param options - The items, the strategy and the callbacks.
 * @returns The handler.
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
        dir: options.getDirection(),
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
