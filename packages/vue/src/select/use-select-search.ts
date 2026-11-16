import { nextTick, ref, shallowRef, watch, type Ref, type ShallowRef } from 'vue';

/** What {@link useSelectSearch} reads. */
export interface SelectSearchOptions {
  /** Whether the list is open. */
  readonly isOpen: Readonly<Ref<boolean>>;
  /** Whether the Select has a search (`filter`). */
  readonly filter: () => boolean;
  /** The trigger element. */
  readonly triggerElement: Readonly<ShallowRef<HTMLElement | null>>;
}

/** What {@link useSelectSearch} returns. */
export interface SelectSearch {
  /** The text of the search; it clears when the list closes. */
  readonly query: Ref<string>;
  /** The search input; `null` while it is not rendered. */
  readonly searchElement: ShallowRef<HTMLElement | null>;
  /** Moves the focus to the trigger now. */
  readonly focusTrigger: () => void;
  /** Moves the focus to the trigger after the next render: the search that held it is gone by then. */
  readonly focusTriggerSoon: () => void;
}

/**
 * The search of a Select with `filter`: the query, and where the focus is. While the list is open the focus is in
 * the search, which mounts with the list, so it moves there once the search has mounted. The query clears when the
 * list closes.
 *
 * @internal
 * @param options - Whether it is open, whether there is a search, and the trigger.
 * @returns The query, the search element and how to move the focus back to the trigger.
 */
export function useSelectSearch({ isOpen, filter, triggerElement }: SelectSearchOptions): SelectSearch {
  const query = ref('');
  const searchElement = shallowRef<HTMLElement | null>(null);
  let focusPending = false;

  const focusTrigger = (): void => {
    triggerElement.value?.focus({ preventScroll: true });
  };

  watch(
    isOpen,
    (open) => {
      if (!open) {
        focusPending = false;
        query.value = '';
      } else if (filter()) {
        if (searchElement.value) searchElement.value.focus({ preventScroll: true });
        else focusPending = true;
      }
    },
    { flush: 'post' },
  );
  watch(
    searchElement,
    (element) => {
      if (!element || !focusPending) return;
      focusPending = false;
      element.focus({ preventScroll: true });
    },
    { flush: 'post' },
  );

  return {
    query,
    searchElement,
    focusTrigger,
    focusTriggerSoon: () => {
      void nextTick(focusTrigger);
    },
  };
}
