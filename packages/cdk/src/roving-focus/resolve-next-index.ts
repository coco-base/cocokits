import type { Direction } from '@cocokits/shared';

/**
 * Which arrow keys move through the items.
 *
 * @cckValue horizontal - Only the left and right arrows move.
 * @cckValue vertical - Only the up and down arrows move.
 * @cckValue both - All four arrows move.
 */
export type RovingOrientation = 'horizontal' | 'vertical' | 'both';

/** One item of a composite widget, read live by the caller. */
export interface RovingItem {
  /** The element of the item. With the `'focus'` strategy, this element takes focus. */
  readonly element: HTMLElement;
  /** Whether the item is disabled. Every key skips a disabled item, but the item stays visible. */
  readonly disabled: boolean;
  /** The text that typeahead matches against. When not set, the text content of the element is used. */
  readonly text?: string | undefined;
}

/** Input of {@link resolveNextIndex}. */
export interface NextIndexInput {
  /** The `key` of the keyboard event. */
  readonly key: string;
  /** The number of items. */
  readonly count: number;
  /** The current index, or `-1` when no item is current. */
  readonly current: number;
  /** Returns whether the item at the index is disabled. */
  readonly isDisabled: (index: number) => boolean;
  /**
   * Which arrow keys move through the items.
   * @defaultValue 'both'
   */
  readonly orientation?: RovingOrientation | undefined;
  /**
   * Whether the arrows wrap from the last item to the first and back.
   * @defaultValue false
   */
  readonly loop?: boolean | undefined;
  /**
   * The direction of the widget; it flips the horizontal arrows only.
   * @defaultValue 'ltr'
   */
  readonly dir?: Direction | undefined;
  /** The number of items that PageUp and PageDown move. When not set, both keys are not handled. */
  readonly pageSize?: number | undefined;
}

/** The first enabled index met walking from `from` by `step`, at most `count` steps; `null` when none. */
function scan(input: NextIndexInput, from: number, step: 1 | -1, wrap: boolean): number | null {
  for (let taken = 0; taken < input.count; taken += 1) {
    let index = from + step * taken;
    if (wrap) index = ((index % input.count) + input.count) % input.count;
    else if (index < 0 || index >= input.count) return null;
    if (!input.isDisabled(index)) return index;
  }
  return null;
}

function direction(input: NextIndexInput): 1 | -1 | null {
  const { orientation = 'both', dir = 'ltr' } = input;
  const horizontal = orientation !== 'vertical';
  const vertical = orientation !== 'horizontal';
  const forwardHorizontal = dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
  const backwardHorizontal = dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
  if ((horizontal && input.key === forwardHorizontal) || (vertical && input.key === 'ArrowDown')) return 1;
  if ((horizontal && input.key === backwardHorizontal) || (vertical && input.key === 'ArrowUp')) return -1;
  return null;
}

/** PageUp and PageDown: a jump of `pageSize` that lands on the nearest enabled item. Without a size, the key is not handled. */
function resolvePage(input: NextIndexInput): number | null {
  if (!input.pageSize || input.pageSize <= 0) return null;
  const step = input.key === 'PageDown' ? 1 : -1;
  const base = input.current < 0 ? (step === 1 ? -1 : input.count) : input.current;
  const target = Math.min(input.count - 1, Math.max(0, base + step * input.pageSize));
  return scan(input, target, step, false) ?? scan(input, target, step === 1 ? -1 : 1, false);
}

/**
 * Decides which index a key moves to, and skips disabled items. It is a pure function.
 * Horizontal arrows flip in `rtl`, and vertical arrows never do.
 *
 * @remarks
 * An arrow steps to the next or previous enabled item. With `loop` it wraps around. Without `loop` it stops at the end
 * and returns the current index. Home and End go to the first and the last enabled item.
 *
 * PageUp and PageDown move by `pageSize` without wrapping, and land on the nearest enabled item. With no current item
 * (`-1`), a forward key goes to the first enabled item and a backward key to the last.
 *
 * Without `orientation`, all four arrows move. Without `loop`, the arrows stop at the ends. Without `dir`, the direction is `'ltr'`.
 *
 * @param input - The key, the list and the options.
 * @returns The new index. It is the current index when the item cannot move. It is `null` when the key is not handled or no item is enabled.
 * @example
 * const next = resolveNextIndex({
 *   key: 'ArrowRight',
 *   count: 3,
 *   current: 2,
 *   isDisabled: () => false,
 *   loop: true,
 * });
 * console.log(next); // 0
 */
export function resolveNextIndex(input: NextIndexInput): number | null {
  if (input.count <= 0) return null;
  const { current, count } = input;
  if (input.key === 'Home') return scan(input, 0, 1, false);
  if (input.key === 'End') return scan(input, count - 1, -1, false);
  if (input.key === 'PageDown' || input.key === 'PageUp') return resolvePage(input);
  const step = direction(input);
  if (step === null) return null;
  if (current < 0) return step === 1 ? scan(input, 0, 1, false) : scan(input, count - 1, -1, false);
  const next = scan(input, current + step, step, input.loop ?? false);
  if (next !== null) return next;
  return scan(input, 0, 1, false) === null ? null : current;
}

/**
 * Finds the index of the item that holds the single tab stop. It is the selected item while that item exists and
 * is enabled. Otherwise it is the first enabled item.
 *
 * @remarks
 * The result comes from the items alone, so a server and a browser agree.
 *
 * @param items - The items in DOM order.
 * @param selectedIndex - The selected index, or `-1`.
 * @returns The index of the tab stop, or `-1` when every item is disabled.
 * @example
 * const stop = resolveTabStop([{ disabled: true }, { disabled: false }], -1);
 * console.log(stop); // 1
 */
export function resolveTabStop(items: readonly { readonly disabled: boolean }[], selectedIndex: number): number {
  if (items[selectedIndex] && !items[selectedIndex].disabled) return selectedIndex;
  return items.findIndex((item) => !item.disabled);
}
