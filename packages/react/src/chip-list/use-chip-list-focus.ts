'use client';

import { useCallback, useRef, type RefObject } from 'react';
import { chipAnatomy } from '@cocokits/machines/chip';
import type { ChipListFocusTarget } from '@cocokits/machines/chip-list';
import { useIsomorphicLayoutEffect } from '../internal/use-isomorphic-layout-effect';

/** What {@link useChipListFocus} returns. */
export interface ChipListFocus {
  /** Moves focus to the text box. */
  readonly focusInput: () => void;
  /** Moves focus to the first enabled button of the chip at a position, or to the text box when it has none. */
  readonly focusChip: (position: number) => void;
  /** Moves focus to `target` after the next commit, so the chips already show the removal. */
  readonly focusAfterCommit: (target: ChipListFocusTarget) => void;
  /** Keeps the click that activated a remove button, so the change can report it. Call it in the capture phase. */
  readonly rememberActivation: (event: Event) => void;
  /** Returns the click kept by `rememberActivation`, once. */
  readonly takeActivation: () => Event | null;
  /** Remembers the remove button that got focus. */
  readonly rememberFocus: (button: HTMLElement) => void;
  /** Forgets the remove button when focus went to another element. */
  readonly forgetFocus: (button: EventTarget, next: EventTarget | null) => void;
}

/**
 * The focus rules of a Chip list. Focus moves to the text box after a remove button is activated, when the
 * remove button that has focus is gone (the chip at its position was removed by the parent), and when the list
 * turns read-only. It does not move when the list is disabled: the text box is disabled too.
 *
 * @param inputRef - The ref of the text box.
 * @param rootRef - The ref of the list root, which holds the chips.
 * @param readOnly - Whether the list is read-only and not disabled.
 * @returns The focus helpers the list calls from its handlers.
 */
export function useChipListFocus(
  inputRef: RefObject<HTMLInputElement | null>,
  rootRef: RefObject<HTMLElement | null>,
  readOnly: boolean,
): ChipListFocus {
  const focusedButton = useRef<HTMLElement | null>(null);
  const activation = useRef<Event | null>(null);
  const pending = useRef<ChipListFocusTarget | null>(null);

  const focusChip = useCallback(
    (position: number) => {
      const chips = [...(rootRef.current?.children ?? [])].filter((child) =>
        child.classList.contains(chipAnatomy.classes.root),
      );
      const target = chips[position]?.querySelector<HTMLElement>('button:not(:disabled)');
      (target ?? inputRef.current)?.focus();
    },
    [rootRef, inputRef],
  );
  const focusAfterCommit = useCallback((target: ChipListFocusTarget) => {
    pending.current = target;
    // A parent that refuses the change renders nothing, so the request ends with the current event loop turn.
    setTimeout(() => {
      pending.current = null;
    }, 0);
  }, []);

  useIsomorphicLayoutEffect(() => {
    const target = pending.current;
    if (target !== null) {
      pending.current = null;
      focusedButton.current = null;
      if (target === 'input') inputRef.current?.focus();
      else focusChip(target);
      return;
    }
    const button = focusedButton.current;
    if (button === null) return;
    const active = button.ownerDocument.activeElement;
    if (!button.isConnected || (readOnly && (active === button || active === button.ownerDocument.body))) {
      focusedButton.current = null;
      inputRef.current?.focus();
    }
  });

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, [inputRef]);
  const rememberActivation = useCallback((event: Event) => {
    activation.current = event;
  }, []);
  const takeActivation = useCallback(() => {
    const event = activation.current;
    activation.current = null;
    return event;
  }, []);
  const rememberFocus = useCallback((button: HTMLElement) => {
    focusedButton.current = button;
  }, []);
  const forgetFocus = useCallback((button: EventTarget, next: EventTarget | null) => {
    if (next !== null && focusedButton.current === button) focusedButton.current = null;
  }, []);

  return { focusInput, focusChip, focusAfterCommit, rememberActivation, takeActivation, rememberFocus, forgetFocus };
}
