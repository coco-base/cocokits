'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { createFormParticipation, type FormParticipation } from '@cocokits/cdk/form-control';

/** Options both modes of {@link useFormParticipation} share. */
interface UseFormParticipationBaseOptions {
  /** Called after an uncanceled reset of the owner form, once the browser has reset the element. */
  readonly onReset?: ((event: Event) => void) | undefined;
}

/** Text mode: the sync writes the value of the text control. */
export interface UseFormParticipationTextOptions extends UseFormParticipationBaseOptions {
  /**
   * Ref of the native text control. A `button`, the trigger of a custom control such as the Select, takes part
   * for the reset, the submit attempt and the disabling fieldset; give `getValue` the button's own value.
   */
  readonly elementRef: RefObject<HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement | null>;
  /** The model value as the DOM should show it; read on every sync. */
  readonly getValue: () => string;
  readonly getChecked?: undefined;
  readonly onUncheckedByGroup?: undefined;
}

/** Checked mode: the sync writes `checked` of a native checkbox or radio. */
export interface UseFormParticipationCheckedOptions extends UseFormParticipationBaseOptions {
  /** Ref of the native checkbox or radio. */
  readonly elementRef: RefObject<HTMLInputElement | null>;
  /** The model's checked state as the DOM should show it; read on every sync. */
  readonly getChecked: () => boolean;
  readonly getValue?: undefined;
  /**
   * Radio: called with the `change` event when the user checked another radio of the same group and this
   * element is unchecked. Whether it is given is read when the element mounts.
   */
  readonly onUncheckedByGroup?: ((event: Event) => void) | undefined;
}

/** Options of {@link useFormParticipation}. */
export type UseFormParticipationOptions = UseFormParticipationTextOptions | UseFormParticipationCheckedOptions;

/** What {@link useFormParticipation} returns. */
export interface FormParticipationBinding {
  /** Whether an ancestor fieldset disables the element; `false` until mount. */
  readonly fieldsetDisabled: boolean;
  /** Whether the owner form was submitted since the last reset; `false` until then. */
  readonly submitted: boolean;
  /** Writes the model value to the element when the two differ; does nothing before mount and after unmount. */
  readonly syncValue: () => void;
}

/**
 * Binds a native text, checkbox or radio control to its owner form with the cdk form-control module. The cdk instance
 * is created in an effect after mount and destroyed on cleanup, so StrictMode's second effect run
 * gets a fresh one. `getValue`, `getChecked`, `onReset` and `onUncheckedByGroup` are read through a latest-callbacks ref assigned in a
 * layout effect (the supported floor is React 19.0, which has no `useEffectEvent`), so the latest
 * committed render's closures run. The element is read when the effect runs (the ref is expected to
 * hold the same element for the component's life).
 *
 * @param options - The element ref, the value or checked state to show and the callbacks.
 * @returns The fieldset and submit facts, and the sync action.
 */
export function useFormParticipation(options: UseFormParticipationOptions): FormParticipationBinding {
  const [fieldsetDisabled, setFieldsetDisabled] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const instance = useRef<FormParticipation | null>(null);
  const latest = useRef(options);

  useLayoutEffect(() => {
    latest.current = options;
  });

  useEffect(() => {
    const element = options.elementRef.current;
    if (element === null) return undefined;
    const callbacks = {
      onReset: (event: Event) => latest.current.onReset?.(event),
      onFieldsetDisabledChange: setFieldsetDisabled,
      onSubmittedChange: setSubmitted,
    };
    const checkedMode = latest.current.getChecked !== undefined;
    const participation = checkedMode
      ? createFormParticipation({
          ...callbacks,
          element: element as HTMLInputElement,
          getChecked: () => latest.current.getChecked?.() ?? false,
          onUncheckedByGroup:
            latest.current.onUncheckedByGroup === undefined
              ? undefined
              : (event) => latest.current.onUncheckedByGroup?.(event),
        })
      : createFormParticipation({ ...callbacks, element, getValue: () => latest.current.getValue?.() ?? '' });
    instance.current = participation;
    return () => {
      participation.destroy();
      instance.current = null;
    };
  }, [options.elementRef]);

  const syncValue = useCallback(() => instance.current?.syncValue(), []);
  return { fieldsetDisabled, submitted, syncValue };
}
