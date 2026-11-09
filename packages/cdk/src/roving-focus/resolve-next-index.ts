import type { Direction } from '@cocokits/shared';

/** Which arrow keys move through the items. */
export type RovingOrientation = 'horizontal' | 'vertical' | 'both';

/** One item of a composite widget, read live by the caller. */
export interface RovingItem {
  /** The item's element (the one that takes focus under the `focus` strategy). */
  readonly element: HTMLElement;
  /** Disabled items are skipped by every key but stay visible. */
  readonly disabled: boolean;
  /** The text typeahead matches against; the element's text content when omitted. */
  readonly text?: string | undefined;
}

/** Input of {@link resolveNextIndex}. */
export interface NextIndexInput {
  /** `KeyboardEvent.key`. */
  readonly key: string;
  /** The number of items. */
  readonly count: number;
  /** The current index, or `-1` when none is current. */
  readonly current: number;
  /** Whether the item at the index is disabled. */
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
  /** The step of PageUp and PageDown; both are unhandled without it. */
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

/** PageUp and PageDown: a jump of `pageSize` that lands on the nearest enabled item; unhandled without a size. */
function resolvePage(input: NextIndexInput): number | null {
  if (!input.pageSize || input.pageSize <= 0) return null;
  const step = input.key === 'PageDown' ? 1 : -1;
  const base = input.current < 0 ? (step === 1 ? -1 : input.count) : input.current;
  const target = Math.min(input.count - 1, Math.max(0, base + step * input.pageSize));
  return scan(input, target, step, false) ?? scan(input, target, step === 1 ? -1 : 1, false);
}

/**
 * Decides which index a key moves to, skipping disabled items. Horizontal arrows flip in `rtl`;
 * vertical ones never do. Pure.
 *
 * - Arrows step to the next or previous enabled item; with `loop` they wrap, without it they stop at
 *   the end (the current index is returned).
 * - Home and End go to the first and last enabled item.
 * - PageUp and PageDown move by `pageSize` without wrapping and land on the nearest enabled item.
 * - With no current item (`-1`) a forward key goes to the first enabled item, a backward key to the last.
 *
 * @param input - The key, the list and the options.
 * @returns The new index (the current one when it cannot move), or `null` when the key is not handled
 * or no item is enabled.
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
 * The index that holds the single tab stop: the selected item while it exists and is enabled,
 * otherwise the first enabled item. Computed from the items alone, so server and client agree.
 *
 * @param items - The items in DOM order.
 * @param selectedIndex - The selected index, or `-1`.
 * @returns The tab stop index, or `-1` when every item is disabled.
 */
export function resolveTabStop(items: readonly { readonly disabled: boolean }[], selectedIndex: number): number {
  if (items[selectedIndex] && !items[selectedIndex].disabled) return selectedIndex;
  return items.findIndex((item) => !item.disabled);
}
