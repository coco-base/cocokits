import { afterNextRender, DestroyRef, ElementRef, inject, signal, type Signal } from '@angular/core';
import { createFormParticipation, type FormParticipation } from '@cocokits/cdk/form-control';

/** Options both modes of {@link injectFormParticipation} take. */
export interface InjectFormParticipationBaseOptions {
  /** Called after an uncanceled reset of the owner form, once the browser has reset the element. */
  readonly onReset?: ((event: Event) => void) | undefined;
}

/** Text mode: the host is a native `input` or `textarea`, and `syncValue()` writes its `.value`. */
export interface InjectFormParticipationTextOptions extends InjectFormParticipationBaseOptions {
  /** The model value as the DOM should show it; read on every sync. */
  readonly getValue: () => string;
  readonly getChecked?: undefined;
  readonly onUncheckedByGroup?: undefined;
  /**
   * The control, read once after the first render. Give it when the host is not the control; a `button`, the
   * trigger of a custom control such as the Select, takes part for the reset, the submit attempt and the
   * disabling fieldset (give `getValue` the button's own value). Left out, the host is the control.
   */
  readonly element?: (() => HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement | undefined) | undefined;
}

/** Checked mode: a native checkbox or radio, and `syncValue()` writes its `.checked`. */
export interface InjectFormParticipationCheckedOptions extends InjectFormParticipationBaseOptions {
  /** The model's checked state as the DOM should show it; read on every sync. */
  readonly getChecked: () => boolean;
  readonly getValue?: undefined;
  /** Radio: called with the `change` event when the user checked another radio of the same group. */
  readonly onUncheckedByGroup?: ((event: Event) => void) | undefined;
  /**
   * The input, read once after the first render. Give it when the input is inside the component's template
   * (the host is not the input); left out, the host is the input.
   */
  readonly element?: (() => HTMLInputElement | undefined) | undefined;
}

/** Options of {@link injectFormParticipation}. */
export type InjectFormParticipationOptions = InjectFormParticipationTextOptions | InjectFormParticipationCheckedOptions;

/** What {@link injectFormParticipation} returns. */
export interface FormParticipationBinding {
  /** Whether an ancestor fieldset disables the host; `false` until the host has rendered. */
  readonly fieldsetDisabled: Signal<boolean>;
  /** Whether the owner form was submitted since the last reset; `false` until then. */
  readonly submitted: Signal<boolean>;
  /** Writes the model value to the host when the two differ; does nothing before render and after destroy. */
  syncValue(): void;
  /**
   * Sets `submitted` back to `false`, for a reset that fires no DOM event (a forms library resetting its
   * model). The next `submit` of the owner form sets it again.
   */
  clearSubmitted(): void;
}

/**
 * Binds a native `input` or `textarea` (the host, or with `element` an input inside the host) to its owner form with the cdk
 * form-control module. The cdk instance is created after the first render in the browser, so
 * the server render sees the starting values (`false`), and it is destroyed with the host. Call it
 * in an injection context.
 *
 * @param options - The value (`getValue`) or checked state (`getChecked`) to show, and the callbacks.
 * @returns The fieldset and submit signals, and the sync action.
 */
export function injectFormParticipation(options: InjectFormParticipationOptions): FormParticipationBinding {
  const host = inject<ElementRef<HTMLInputElement | HTMLTextAreaElement>>(ElementRef).nativeElement;
  const fieldsetDisabled = signal(false);
  const submitted = signal(false);
  let participation: FormParticipation | undefined;

  afterNextRender(() => {
    const callbacks = {
      onReset: options.onReset,
      onFieldsetDisabledChange: (disabled: boolean) => {
        fieldsetDisabled.set(disabled);
      },
      onSubmittedChange: (value: boolean) => {
        submitted.set(value);
      },
    };
    if (options.getChecked) {
      const element = options.element?.() ?? (host as HTMLInputElement);
      participation = createFormParticipation({
        ...callbacks,
        element,
        getChecked: options.getChecked,
        onUncheckedByGroup: options.onUncheckedByGroup,
      });
    } else {
      participation = createFormParticipation({
        ...callbacks,
        element: options.element?.() ?? host,
        getValue: options.getValue,
      });
    }
  });

  inject(DestroyRef).onDestroy(() => {
    participation?.destroy();
    participation = undefined;
  });

  return {
    fieldsetDisabled: fieldsetDisabled.asReadonly(),
    submitted: submitted.asReadonly(),
    syncValue: () => participation?.syncValue(),
    clearSubmitted: () => {
      submitted.set(false);
    },
  };
}
