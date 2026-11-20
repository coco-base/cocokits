import { ref, watchEffect, type Ref } from 'vue';
import { createFormParticipation, type FormParticipation } from '@cocokits/cdk/form-control';

/** Options shared by both modes of {@link useFormParticipation}. */
export interface UseFormParticipationBaseOptions {
  /** Called after an uncanceled reset of the owner form, once the browser has reset the element. */
  readonly onReset?: ((event: Event) => void) | undefined;
}

/** Text mode: `syncValue()` writes `.value`. */
export interface UseFormParticipationTextOptions extends UseFormParticipationBaseOptions {
  /**
   * Template ref of the native text control; `null` or `undefined` until mount. A `button`, the trigger of a
   * custom control such as the Select, takes part for the reset, the submit attempt and the disabling fieldset;
   * give `getValue` the button's own value.
   */
  readonly elementRef: Readonly<Ref<HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement | null | undefined>>;
  /** The model value as the DOM should show it; read on every sync. */
  readonly getValue: () => string;
  readonly getChecked?: undefined;
  readonly onUncheckedByGroup?: undefined;
}

/** Checked mode: `syncValue()` writes `.checked`. */
export interface UseFormParticipationCheckedOptions extends UseFormParticipationBaseOptions {
  /** Template ref of the native checkbox or radio; `null` or `undefined` until mount. */
  readonly elementRef: Readonly<Ref<HTMLInputElement | null | undefined>>;
  /** The model's checked state as the DOM should show it; read on every sync. */
  readonly getChecked: () => boolean;
  readonly getValue?: undefined;
  /** Radio: called with the `change` event when the user checked another radio of the same group. */
  readonly onUncheckedByGroup?: ((event: Event) => void) | undefined;
}

/** Options of {@link useFormParticipation}. */
export type UseFormParticipationOptions = UseFormParticipationTextOptions | UseFormParticipationCheckedOptions;

/** What {@link useFormParticipation} returns. */
export interface FormParticipationBinding {
  /** Whether an ancestor fieldset disables the element; `false` until mount. */
  readonly fieldsetDisabled: Readonly<Ref<boolean>>;
  /** Whether the owner form was submitted since the last reset; `false` until then. */
  readonly submitted: Readonly<Ref<boolean>>;
  /** Writes the model value (or `checked`) to the element when the two differ; does nothing before mount and after unmount. */
  readonly syncValue: () => void;
}

/**
 * Binds a native text, checkbox or radio control to its owner form with the cdk form-control module. The cdk instance
 * is created after mount (a post-flush effect, which does not run on the server), follows the
 * element ref, and is destroyed when the element goes away or the component unmounts.
 *
 * @param options - The element ref, the value or checked state to show, and the callbacks.
 * @returns The fieldset and submit facts, and the sync action.
 */
export function useFormParticipation(options: UseFormParticipationOptions): FormParticipationBinding {
  const fieldsetDisabled = ref(false);
  const submitted = ref(false);
  let instance: FormParticipation | undefined;

  watchEffect(
    (onCleanup) => {
      const element = options.elementRef.value;
      if (element === null || element === undefined) return;
      const shared = {
        onReset: options.onReset,
        onFieldsetDisabledChange: (disabled: boolean) => {
          fieldsetDisabled.value = disabled;
        },
        onSubmittedChange: (value: boolean) => {
          submitted.value = value;
        },
      };
      const participation =
        options.getChecked === undefined
          ? createFormParticipation({ ...shared, element, getValue: options.getValue })
          : createFormParticipation({
              ...shared,
              element: element as HTMLInputElement,
              getChecked: options.getChecked,
              onUncheckedByGroup: options.onUncheckedByGroup,
            });
      instance = participation;
      onCleanup(() => {
        participation.destroy();
        if (instance === participation) instance = undefined;
      });
    },
    { flush: 'post' },
  );

  return { fieldsetDisabled, submitted, syncValue: () => instance?.syncValue() };
}
