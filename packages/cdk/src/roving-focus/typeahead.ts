/** What typeahead reads of an item. */
export interface TypeaheadItem {
  /** Disabled items are skipped. */
  readonly disabled: boolean;
  /** The text the typed characters match against. */
  readonly text: string;
}

/** Type-to-find over the text of the items. */
export interface Typeahead {
  /**
   * Adds a typed character to the buffer and finds the item to move to. A single character looks after
   * the current item and a repeated character (`aaa`) cycles through the items that start with it; a
   * longer string refines from the current item. Disabled items are skipped. A space does not start a
   * buffer, but extends a running one. Case and accents are ignored (`e` finds "Éclair").
   *
   * @param char - `KeyboardEvent.key` of a printable key.
   * @param items - The items in DOM order.
   * @param current - The current index, or `-1`.
   * @returns The matching index, or `null` when nothing matches or the key is not a character.
   */
  match(char: string, items: readonly TypeaheadItem[], current: number): number | null;
  /** Whether a search is running: the buffer is not empty (it empties after the pause or on `reset()`). */
  isActive(): boolean;
  /** Empties the buffer and cancels its timer. */
  reset(): void;
}

/** Options of {@link createTypeahead}. */
export interface TypeaheadOptions {
  /** How long a pause empties the buffer, in milliseconds. @defaultValue 500 */
  readonly timeoutMs?: number | undefined;
}

const textOf = (item: TypeaheadItem): string => item.text.trim();

/**
 * Creates the typeahead buffer of one widget. The buffer empties after a pause of `timeoutMs`, with
 * one timer that `reset()` also clears.
 *
 * @param options - The pause length.
 * @returns The typeahead.
 */
export function createTypeahead(options: TypeaheadOptions = {}): Typeahead {
  const timeoutMs = options.timeoutMs ?? 500;
  let buffer = '';
  let timer: ReturnType<typeof setTimeout> | undefined;
  let collator: Intl.Collator | undefined;

  const reset = (): void => {
    buffer = '';
    clearTimeout(timer);
    timer = undefined;
  };

  return {
    match(char, items, current) {
      if (char.length !== 1 || (char === ' ' && buffer === '') || items.length === 0) return null;
      buffer += char.toLowerCase();
      clearTimeout(timer);
      timer = setTimeout(reset, timeoutMs);
      collator ??= new Intl.Collator(undefined, { sensitivity: 'base' });
      const compare = collator;
      const repeated = buffer.length > 1 && buffer === buffer.slice(0, 1).repeat(buffer.length);
      const prefix = repeated ? buffer.slice(0, 1) : buffer;
      const start = buffer.length === 1 || repeated ? current + 1 : Math.max(current, 0);
      for (let taken = 0; taken < items.length; taken += 1) {
        const index = (start + taken) % items.length;
        const item = items[index];
        if (item && !item.disabled && compare.compare(textOf(item).slice(0, prefix.length), prefix) === 0) return index;
      }
      return null;
    },
    isActive: () => buffer !== '',
    reset,
  };
}
