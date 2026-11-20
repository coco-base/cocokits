'use client';

import { useCallback, useRef, useState } from 'react';
import { makeCancelable, type PlainDetails } from './cancelable-change-details';
import { isDevelopment } from './dev';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';

/** What {@link useControllableState} needs. */
export interface ControllableStateOptions<T, D> {
  /** The controlled value; `undefined` leaves the state uncontrolled. */
  readonly value: T | undefined;
  /** The start value of an uncontrolled state, read once. */
  readonly defaultValue: T;
  /** Called from the setter when the value changes, also when the parent may refuse the change. */
  readonly onChange: ((value: T, details: D) => void) | undefined;
  /** The prop name used in the development warning. */
  readonly name: string;
  /**
   * Gives `onChange` details with `cancel()` and `isCanceled`, so `D` must be `CancelableChangeDetails`. A canceled
   * change leaves the state as it was.
   *
   * @defaultValue false
   */
  readonly cancelable?: boolean | undefined;
}

/**
 * One source of truth for a prop that is controlled or uncontrolled. The setter is stable, changes the inner
 * state only when uncontrolled, and reports through `onChange` only when the value differs from the current
 * one, so a controlled parent that does not update the prop keeps the old value. The setter says whether the
 * change was accepted: `false` only when `onChange` canceled it.
 *
 * @param options - The prop, its default and the change callback.
 * @returns The current value, the setter, and a quiet setter that changes an uncontrolled state without calling
 * `onChange`, for a change the parent itself caused.
 */
export function useControllableState<T, D>(
  options: ControllableStateOptions<T, D>,
): readonly [T, (next: T, details: PlainDetails<D>) => boolean, (next: T) => void] {
  const controlled = options.value !== undefined;
  const [inner, setInner] = useState(options.defaultValue);
  const current = controlled ? (options.value as T) : inner;

  // Read by the setter, which handlers and listeners created once call.
  const latest = useRef({ controlled, current, onChange: options.onChange, cancelable: options.cancelable });
  useIsomorphicLayoutEffect(() => {
    latest.current = { controlled, current, onChange: options.onChange, cancelable: options.cancelable };
  });

  const initiallyControlled = useRef(controlled);
  useIsomorphicLayoutEffect(() => {
    if (isDevelopment() && initiallyControlled.current !== controlled) {
      console.error(
        `CocoKits: ${options.name} changed from ${initiallyControlled.current ? 'controlled' : 'uncontrolled'} to ${controlled ? 'controlled' : 'uncontrolled'}. Pick one for the lifetime of the component.`,
      );
      initiallyControlled.current = controlled;
    }
  }, [controlled, options.name]);

  const set = useCallback((next: T, details: PlainDetails<D>): boolean => {
    const state = latest.current;
    if (Object.is(next, state.current)) return true;
    const given = (state.cancelable ? makeCancelable(details as never) : details) as D;
    state.onChange?.(next, given);
    if (state.cancelable && (given as { isCanceled?: boolean }).isCanceled === true) return false;
    if (!state.controlled) {
      // A second request before the next render compares with this one.
      state.current = next;
      setInner(next);
    }
    return true;
  }, []);

  const setQuietly = useCallback((next: T): void => {
    const state = latest.current;
    if (state.controlled) return;
    state.current = next;
    setInner(next);
  }, []);

  return [current, set, setQuietly];
}
