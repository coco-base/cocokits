'use client';

import { useCallback, useRef, useState } from 'react';
import {
  resolveSelectHighlight,
  resolveSelectTypeahead,
  type SelectInitialHighlight,
  type SelectState,
} from '@cocokits/machines/select';
import { useIsomorphicLayoutEffect } from '../internal/use-isomorphic-layout-effect';
import type { SelectItemRegistration } from './select-item-registration';

/** What an opening key asks for once the options have mounted. */
interface PendingOpen {
  readonly initial: SelectInitialHighlight;
  /** The character that opened a closed Select by typing. */
  readonly char?: string;
}

/** What {@link useSelectHighlight} returns. */
export interface SelectHighlight {
  /** The key of the highlighted option while the list is open. */
  readonly highlighted: string | undefined;
  /** Sets the highlight (`undefined` clears it). */
  readonly set: (key: string | undefined) => void;
  /** Scrolls the highlighted option into view after the next commit. */
  readonly reveal: () => void;
  /** An opening key: the highlight starts when the options have mounted, on `initial` or on the typed `char`. */
  readonly begin: (initial: SelectInitialHighlight, char?: string) => void;
}

/** What the hook reads. */
export interface SelectHighlightOptions<T> {
  /** Whether the Select is open. */
  readonly isOpen: boolean;
  /** The registered options. */
  readonly registry: readonly SelectItemRegistration<T>[];
  /** The machine state, without the highlight. */
  readonly state: SelectState<T>;
}

/**
 * The highlighted option. The options mount with the list, so an opening key waits for them: the highlight
 * starts then, on the selected option (else the first enabled one), and a typed character that opened the list
 * finds its option then. An open that came from outside starts the same way. The highlighted option scrolls into
 * view at the nearest edge after a keyboard move or an open.
 *
 * @param options - Whether it is open, the registry and the state.
 * @returns The highlight and how to move, reveal and start it.
 */
export function useSelectHighlight<T>({ isOpen, registry, state }: SelectHighlightOptions<T>): SelectHighlight {
  const pending = useRef<PendingOpen | null>(null);
  const [highlighted, setHighlighted] = useState<string | undefined>(undefined);
  const [revealTick, setRevealTick] = useState(0);
  const latest = useRef({ highlighted, registry });
  useIsomorphicLayoutEffect(() => {
    latest.current = { highlighted, registry };
  });
  const items = state.items;

  useIsomorphicLayoutEffect(() => {
    if (!isOpen) {
      pending.current = null;
      setHighlighted(undefined);
      return;
    }
    if (items.length === 0 || (pending.current === null && highlighted !== undefined)) return;
    const request = pending.current ?? { initial: 'selected' as const };
    pending.current = null;
    // A typed character is looked up as on a closed Select: after the selected option.
    const found = request.char === undefined ? null : resolveSelectTypeahead({ ...state, open: false }, request.char);
    setHighlighted(resolveSelectHighlight(state, found === null ? request.initial : { key: found }) ?? undefined);
    setRevealTick((tick) => tick + 1);
    // The effect follows the open state and the items; the rest is read from the render that scheduled it.
  }, [isOpen, items]);

  useIsomorphicLayoutEffect(() => {
    if (revealTick === 0) return;
    const { highlighted: key, registry: options } = latest.current;
    options.find((option) => option.key === key)?.element.scrollIntoView({ block: 'nearest' });
  }, [revealTick]);

  const reveal = useCallback(() => {
    setRevealTick((tick) => tick + 1);
  }, []);
  const begin = useCallback((initial: SelectInitialHighlight, char?: string) => {
    pending.current = char === undefined ? { initial } : { initial, char };
  }, []);
  return { highlighted, set: setHighlighted, reveal, begin };
}
