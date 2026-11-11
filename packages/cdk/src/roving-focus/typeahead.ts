/** What typeahead reads of an item. */
export interface TypeaheadItem {
  /** Whether the item is disabled. A disabled item is skipped. */
  readonly disabled: boolean;
  /** The text that the typed characters match against. */
  readonly text: string;
}

/** Type-to-find over the text of a list of items. */
export interface Typeahead {
  /**
   * Adds a typed character to the buffer and finds the item to move to.
   *
   * @remarks
   * A single character looks after the current item. A repeated character such as `aaa` cycles through the items that
   * start with it. A longer string refines the search from the current item.
   *
   * Disabled items are skipped. A space does not start a buffer, but it extends a running one. Case and accents are
   * ignored, so `e` finds "Éclair".
   *
   * @param char - The `key` of a printable keyboard event.
   * @param items - The items in DOM order.
   * @param current - The current index, or `-1`.
   * @returns The matching index, or `null` when nothing matches or the key is not a character.
   * @example
   * const index = typeahead.match('b', [{ disabled: false, text: 'Apple' }, { disabled: false, text: 'Banana' }], 0);
   * console.log(index); // 1
   */
  match(char: string, items: readonly TypeaheadItem[], current: number): number | null;
  /** Whether a search is running, which means the buffer is not empty. The buffer empties after the pause or on `reset()`. */
  isActive(): boolean;
  /** Empties the buffer and cancels its timer. */
  reset(): void;
}

/** Options of {@link createTypeahead}. */
export interface TypeaheadOptions {
  /**
   * How long a pause empties the buffer, in milliseconds.
   * @defaultValue 500
   */
  readonly timeoutMs?: number | undefined;
}

const textOf = (item: TypeaheadItem): string => item.text.trim();

/**
 * Creates the type-to-find buffer of one widget. The buffer empties after a pause of `timeoutMs`.
 * One timer does this, and `reset()` clears it too.
 *
 * @param options - The pause length.
 * @returns The typeahead.
 * @example
 * const typeahead = createTypeahead({ timeoutMs: 400 });
 * const items = [{ disabled: false, text: 'Apple' }, { disabled: false, text: 'Banana' }];
 * const index = typeahead.match('a', items, -1);
 * console.log(index); // 0
 * typeahead.reset();
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
