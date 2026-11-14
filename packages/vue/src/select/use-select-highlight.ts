import { ref, watch, type Ref, type ShallowRef } from 'vue';
import {
  resolveSelectHighlight,
  resolveSelectTypeahead,
  type SelectInitialHighlight,
  type SelectState,
} from '@cocokits/machines/select';
import type { SelectItemRegistration } from './select.context';

/** What an opening key asks for once the items have mounted. */
interface PendingOpen {
  readonly initial: SelectInitialHighlight;
  /** The character that opened a closed Select by typing. */
  readonly char?: string;
}

/** What {@link useSelectHighlight} returns. */
export interface SelectHighlight {
  /** The key of the highlighted option while the list is open. */
  readonly highlighted: Ref<string | undefined>;
  /** Scrolls the highlighted option into view after the next update. */
  readonly reveal: () => void;
  /** An opening key: the highlight starts when the items have mounted, on `initial` or on the typed `char`. */
  readonly begin: (initial: SelectInitialHighlight, char?: string) => void;
}

/** What the composable reads. */
export interface SelectHighlightOptions<T> {
  /** Whether the Select is open. */
  readonly isOpen: Readonly<Ref<boolean>>;
  /** The registered items. */
  readonly registry: Readonly<ShallowRef<readonly SelectItemRegistration<T>[]>>;
  /** The machine state, without the highlight. */
  readonly state: () => SelectState<T>;
}

/**
 * The highlighted option. The items mount with the list, so an opening key waits for them: the highlight
 * starts then, on the selected option (else the first enabled one), and a typed character that opened the list
 * finds its item then. An open that came from outside starts the same way. The highlighted item scrolls into
 * view at the nearest edge after a keyboard move or an open.
 *
 * @param options - Whether it is open, the registry and the state.
 * @returns The highlight and how to reveal and start it.
 */
export function useSelectHighlight<T>({ isOpen, registry, state }: SelectHighlightOptions<T>): SelectHighlight {
  const highlighted = ref<string | undefined>(undefined);
  const revealTick = ref(0);
  let pending: PendingOpen | null = null;

  watch(
    [isOpen, registry],
    ([open, options]) => {
      if (!open) {
        pending = null;
        highlighted.value = undefined;
        return;
      }
      if (options.length === 0 || (pending === null && highlighted.value !== undefined)) return;
      const request = pending ?? { initial: 'selected' as const };
      pending = null;
      const current = state();
      // A typed character is looked up as on a closed Select: after the selected option.
      const found =
        request.char === undefined ? null : resolveSelectTypeahead({ ...current, open: false }, request.char);
      highlighted.value =
        resolveSelectHighlight(current, found === null ? request.initial : { key: found }) ?? undefined;
      revealTick.value += 1;
    },
    { flush: 'post' },
  );

  watch(
    revealTick,
    () => {
      const key = highlighted.value;
      registry.value.find((option) => option.key === key)?.element.scrollIntoView({ block: 'nearest' });
    },
    { flush: 'post' },
  );

  return {
    highlighted,
    reveal: () => {
      revealTick.value += 1;
    },
    begin: (initial, char) => {
      pending = char === undefined ? { initial } : { initial, char };
    },
  };
}
