import { computed, inject, InjectionToken, Signal, signal, WritableSignal } from '@angular/core';
import { AbstractControl } from '@angular/forms';

import { AbstractControlSignalStates } from '@cocokits/angular-utils';

export const FormFieldStore = new InjectionToken<FormFieldStoreService>('FORM_FIELD_STORE_SERVICE');

export function injectFormFieldStore() {
  return inject(FormFieldStore, { optional: true }) ?? new FormFieldStoreService();
}

export class FormFieldStoreService {
  public ngControl: AbstractControl | null = null;
  public control: AbstractControlSignalStates | null = null;

  public error: { components: WritableSignal<{ id: string; force: Signal<boolean> }[]> } = {
    components: signal([]),
  };

  public select: {
    disabled: Signal<boolean | null | undefined> | null;
    required: Signal<boolean | null | undefined> | null;
  } = {
      disabled: null,
      required: null,
    };

  public textarea: {
    disabled: Signal<boolean | null | undefined> | null;
    required: Signal<boolean | null | undefined> | null;
    focused: WritableSignal<boolean | null | undefined> | null;
  } = {
      disabled: null,
      required: null,
      focused: null,
    };

  public input: {
    disabled: Signal<boolean | null | undefined> | null;
    required: Signal<boolean | null | undefined> | null;
    focused: WritableSignal<boolean | null | undefined> | null;
  } = {
      disabled: null,
      required: null,
      focused: null,
    };

  public formField: {
    hasFormField: boolean;
    disable: Signal<boolean | null | undefined> | null;
    hideRequiredMarker: Signal<boolean | null | undefined> | null;
    wrapperElem: HTMLElement | null;
  } = {
      hasFormField: false,
      disable: null,
      hideRequiredMarker: null,
      wrapperElem: null,
    };

  private disabled = computed(
    () =>
      this.input.disabled?.() ??
      this.textarea.disabled?.() ??
      this.select.disabled?.() ??
      this.formField.disable?.() ??
      this.control?.disabled() ??
      false
  );

  public state = {
    disabled: this.disabled,
    hasInput: computed(() => this.input.disabled !== null),
    hasTextarea: computed(() => this.textarea.disabled !== null),
    hasSelect: computed(() => this.select.disabled !== null),
    hideRequiredMarker: computed(() => this.formField.hideRequiredMarker?.() ?? false),
    required: computed(
      () =>
        this.input.required?.() ??
        this.textarea.required?.() ??
        this.select.required?.() ??
        this.control?.required() ??
        false
    ),
    focused: computed(() => {
      return this.disabled() ? false : this.input.focused?.() ?? this.textarea.focused?.();
    }),
    hasError: computed(() => {
      if (this.control?.invalid() && this.control?.dirty() && this.control?.touched()) {
        return true;
      }

      return this.error.components().some((component) => component.force());
    }),
  };
}
