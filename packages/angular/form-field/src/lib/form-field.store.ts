import { computed, inject, InjectionToken, Signal, signal, WritableSignal } from '@angular/core';

import { AbstractControlSignalStates } from '@cocokits/angular-utils';

export const FormFieldStore = new InjectionToken<FormFieldStoreService>('FORM_FIELD_STORE_SERVICE');

export function injectFormFieldStore() {
  return inject(FormFieldStore, { optional: true }) ?? new FormFieldStoreService();
}

export class FormFieldStoreService {
  public error: { components: WritableSignal<{ id: string; force: Signal<boolean> }[]> } = {
    components: signal([]),
  };

  public input: {
    disabled: Signal<boolean | null | undefined> | null;
    control: AbstractControlSignalStates | null;
    required: Signal<boolean | null | undefined> | null;
    focused: WritableSignal<boolean | null | undefined> | null;
  } = {
      disabled: null,
      control: null,
      required: null,
      focused: null,
    };

  public formField: {
    hasFormField: boolean;
    disable: Signal<boolean | null | undefined> | null;
    hideRequiredMarker: Signal<boolean | null | undefined> | null;
  } = {
      hasFormField: false,
      disable: null,
      hideRequiredMarker: null,
    };

  public state = {
    disabled: computed(
      () => this.input.disabled?.() ?? this.formField.disable?.() ?? this.input.control?.disabled() ?? false
    ),
    hideRequiredMarker: computed(() => this.formField.hideRequiredMarker?.() ?? false),
    required: computed(() => this.input.required?.() ?? this.input.control?.required() ?? false),
    focused: computed(() => {
      const disable = this.input.disabled?.() ?? this.formField.disable?.() ?? false;
      return disable ? false : this.input.focused?.();
    }),
    hasError: computed(() => {
      if (this.input.control?.invalid() && this.input.control?.dirty() && this.input.control?.touched()) {
        return true;
      }

      return this.error.components().some((component) => component.force());
    }),
  };
}
