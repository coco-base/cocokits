import { DestroyRef, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormControlStatus, ValidationErrors, Validators } from '@angular/forms';

export interface FromControlOption {
  destroyRef?: DestroyRef;
}

export interface AbstractControlSignalStates<T = unknown> {
  value: WritableSignal<T>;
  dirty: WritableSignal<boolean>;
  disabled: WritableSignal<boolean>;
  enabled: WritableSignal<boolean>;
  invalid: WritableSignal<boolean>;
  pending: WritableSignal<boolean>;
  pristine: WritableSignal<boolean>;
  status: WritableSignal<FormControlStatus>;
  touched: WritableSignal<boolean>;
  untouched: WritableSignal<boolean>;
  valid: WritableSignal<boolean>;
  errors: WritableSignal<ValidationErrors | null>;
  required: WritableSignal<boolean>;
}

export function fromControl<T = unknown>(
  control: AbstractControl,
  options: FromControlOption = {}
): AbstractControlSignalStates<T> {
  const states: AbstractControlSignalStates<T> = {
    value: signal(control.value),
    dirty: signal(control.dirty),
    disabled: signal(control.disabled),
    enabled: signal(control.enabled),
    invalid: signal(control.invalid),
    pending: signal(control.pending),
    pristine: signal(control.pristine),
    status: signal(control.status),
    touched: signal(control.touched),
    untouched: signal(control.untouched),
    valid: signal(control.valid),
    errors: signal(control.errors),
    required: signal(control.hasValidator(Validators.required)),
  };

  control.events.pipe(takeUntilDestroyed(options.destroyRef)).subscribe(() => {
    states.value.set(control.value);
    states.dirty.set(control.dirty);
    states.disabled.set(control.disabled);
    states.enabled.set(control.enabled);
    states.invalid.set(control.invalid);
    states.pending.set(control.pending);
    states.pristine.set(control.pristine);
    states.status.set(control.status);
    states.touched.set(control.touched);
    states.untouched.set(control.untouched);
    states.valid.set(control.valid);
    states.errors.set(control.errors);
    states.required.set(control.hasValidator(Validators.required));
  });

  return states;
}
