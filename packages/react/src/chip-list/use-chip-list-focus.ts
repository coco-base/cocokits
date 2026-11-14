'use client';

import { useCallback, useRef, type RefObject } from 'react';
import { useIsomorphicLayoutEffect } from '../internal/use-isomorphic-layout-effect';

/** What {@link useChipListFocus} returns. */
export interface ChipListFocus {
  /** Moves focus to the text box. */
  readonly focusInput: () => void;
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
 * @param readOnly - Whether the list is read-only and not disabled.
 * @returns The focus helpers the list calls from its handlers.
 */
export function useChipListFocus(inputRef: RefObject<HTMLInputElement | null>, readOnly: boolean): ChipListFocus {
  const focusedButton = useRef<HTMLElement | null>(null);
  const activation = useRef<Event | null>(null);

  useIsomorphicLayoutEffect(() => {
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

  return { focusInput, rememberActivation, takeActivation, rememberFocus, forgetFocus };
}
