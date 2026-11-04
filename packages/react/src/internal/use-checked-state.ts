'use client';

import { useCallback, useEffect, useRef, useState, type MouseEvent, type RefObject } from 'react';
import { toReactProps, useFormParticipation, type FormParticipationBinding } from '@cocokits/react-core';
import type { ChoiceControlChangeDetails } from './choice-control.types';
import { withoutReserved } from './merge-props';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';

/** What {@link useCheckedState} needs from the control. */
export interface CheckedStateOptions {
  /** The `checked` prop: `undefined` leaves the control uncontrolled, `null` is the controlled unchecked value. */
  readonly checked: boolean | null | undefined;
  /** The `defaultChecked` prop. */
  readonly defaultChecked: boolean | undefined;
  /** The `onCheckedChange` prop. */
  readonly onCheckedChange: ((checked: boolean, details: ChoiceControlChangeDetails) => void) | undefined;
  /** The ref of the native input; the component merges it with the author's `ref`. */
  readonly elementRef: RefObject<HTMLInputElement | null>;
  /** Radio: follow the uncheck that another radio of the group causes. */
  readonly followGroup: boolean;
  /** Checkbox and Switch: a user change is blocked while the control is read-only. */
  readonly readOnly: boolean;
  /** Called after a user change, for the facts the control tracks. */
  readonly onUserChange?: (() => void) | undefined;
  /** Called after an uncanceled reset of the owner form, for the facts the control tracks. */
  readonly onReset?: (() => void) | undefined;
  /** Called with the input after the user's change was reported, for what the browser clears (the mixed state). */
  readonly onChangeReported?: ((element: HTMLInputElement) => void) | undefined;
}

/** What {@link useCheckedState} returns. */
export interface CheckedState {
  /** The checked value the machine renders: the prop, or the value read from the DOM. */
  readonly checked: boolean;
  /** The fieldset and submit facts of the cdk. */
  readonly participation: FormParticipationBinding;
  /** The props for the native input besides the machine's: the start state and the click handler. */
  readonly inputProps: Record<string, unknown>;
  /** Reads `checked` from the element into the state of an uncontrolled control; call it on focus and blur. */
  readonly readFromDom: () => void;
}

/**
 * The checked value of a native checkbox or radio. The input is always an uncontrolled DOM input that starts
 * from the checked state at mount (so a form reset restores it and the server HTML carries the `checked`
 * attribute). Uncontrolled, the DOM is the source and is read after every commit, so a state written through
 * the ref (react-hook-form `register()`) survives re-renders. Controlled, the DOM is written from the prop
 * after the prop changes and after every reported change, so a change the parent rejects is restored.
 *
 * A user change is reported from the native `change` event of the input, so `details.event` is that event and
 * in a radio group the radio that lost the check reports before the one that gained it, as in Angular.
 *
 * @param options - The props and the element ref.
 * @returns The checked value to render, the form binding and the props for the input.
 */
export function useCheckedState(options: CheckedStateOptions): CheckedState {
  const { checked, defaultChecked, elementRef, followGroup, readOnly } = options;
  const controlled = checked !== undefined;
  const [mountChecked] = useState(() => (checked ?? defaultChecked) === true);
  const [domChecked, setDomChecked] = useState(mountChecked);
  const current = controlled ? checked === true : domChecked;

  // Read by the native listeners, which are created once.
  const latest = useRef({ ...options, current, controlled });
  useIsomorphicLayoutEffect(() => {
    latest.current = { ...options, current, controlled };
  });

  // The model as the last commit rendered it, and whether it just became unchecked: a radio that a parent
  // handler already re-rendered unchecked when the group's `change` arrives still counts as checked.
  const model = useRef(current);
  const justUnchecked = useRef(false);
  useIsomorphicLayoutEffect(() => {
    if (!current && model.current) {
      justUnchecked.current = true;
      const timer = setTimeout(() => {
        justUnchecked.current = false;
      }, 0);
      model.current = current;
      return () => {
        clearTimeout(timer);
      };
    }
    model.current = current;
    return undefined;
  }, [current]);

  const readFromDom = (): void => {
    const element = elementRef.current;
    if (!controlled && element) setDomChecked(element.checked);
  };
  // The DOM can change without an event (a ref write, the browser restoring a state), so read it after every commit.
  useIsomorphicLayoutEffect(readFromDom);

  // Controlled: the prop is the truth. Written when it changes; `restore` writes it after a reported change.
  const restore = useCallback((): void => {
    const element = elementRef.current;
    const wanted = latest.current.current;
    if (latest.current.controlled && element && element.checked !== wanted) element.checked = wanted;
  }, [elementRef]);
  useIsomorphicLayoutEffect(restore, [controlled, checked]);

  const participation = useFormParticipation({
    elementRef,
    getChecked: () => (controlled ? checked === true : (elementRef.current?.checked ?? false)),
    onReset: (event) => {
      const next = controlled ? mountChecked : (elementRef.current?.checked ?? false);
      setDomChecked(next);
      options.onReset?.();
      options.onCheckedChange?.(next, { reason: 'form-reset', event });
    },
    onUncheckedByGroup: followGroup
      ? (event) => {
          if (!model.current && !justUnchecked.current) return;
          setDomChecked(false);
          options.onUserChange?.();
          options.onCheckedChange?.(false, { reason: 'user', event });
          // Not a microtask: the browser runs microtasks between the listeners of one `change` event, so this radio
          // would be checked again before the radio the user checked has reported, and its change would be lost.
          setTimeout(restore, 0);
        }
      : undefined,
  });

  // The user's change, from the native `change` event. A canceled click (read-only) fires none. The listener is
  // set again after every commit, so an input that a changed `render` element remounted gets one too.
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return undefined;
    const onChange = (event: Event): void => {
      const { onCheckedChange, onUserChange, onChangeReported } = latest.current;
      setDomChecked(element.checked);
      onUserChange?.();
      onCheckedChange?.(element.checked, { reason: 'user', event });
      onChangeReported?.(element);
      // A parent that accepted the change re-renders before this runs; one that did not gets its value back.
      queueMicrotask(restore);
    };
    element.addEventListener('change', onChange);
    return () => {
      element.removeEventListener('change', onChange);
    };
  });

  // The write-back after a read-only click; cleared on unmount.
  const writeBack = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(
    () => () => {
      clearTimeout(writeBack.current);
    },
    [],
  );

  return {
    checked: current,
    participation,
    inputProps: {
      defaultChecked: mountChecked,
      onClick: (event: MouseEvent<HTMLInputElement>) => {
        if (!readOnly) return;
        // Canceling the activation makes the browser restore the state, with no `change` event.
        event.preventDefault();
        // The restore does not go through the `checked` property, so React's value tracker would still hold the
        // toggled state and miss the next real click (an `onChange` the author passed). Writing the model through
        // the property syncs it.
        const element = event.currentTarget;
        const restored = current;
        writeBack.current = setTimeout(() => {
          element.checked = restored;
        }, 0);
      },
    },
    readFromDom,
  };
}

/**
 * The machine's input part as React props, without `checked`: the model is rendered through the start state of
 * {@link useCheckedState}, which a form reset restores.
 *
 * @param machineInput - The `input` part of the machine result.
 * @returns A new record with React names.
 */
export function machineInputProps(machineInput: object): Record<string, unknown> {
  return withoutReserved({ ...toReactProps(machineInput) }, ['checked']);
}
