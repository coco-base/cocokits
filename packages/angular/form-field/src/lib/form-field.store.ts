import { ChangeDetectorRef, computed, inject, InjectionToken, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormControlStatus, ValidationErrors, Validators } from '@angular/forms';

import { map, Observable, startWith, Subject, switchMap } from 'rxjs';

import { toDeepSignal } from '@cocokits/angular-utils';
import { DeepNullable, recordReduceMerge } from '@cocokits/common-utils';

import { ChipListComponent } from './chip-list/chip-list.component';
import { ErrorComponent } from './error/error.component';
import { FormFieldComponent } from './form-field/form-field.component';
import { InputComponent } from './input/input.component';
import { SelectComponent } from './select/select.component';
import { TextareaComponent } from './textarea/textarea.component';

export const FormFieldStore = new InjectionToken<FormFieldStoreService>('FORM_FIELD_STORE_SERVICE');

export function injectFormFieldStore() {
  return inject(FormFieldStore, { optional: true }) ?? new FormFieldStoreService();
}

export interface ControllerStore<T> {
  value: T;
  dirty: boolean;
  enabled: boolean;
  disabled: boolean;
  invalid: boolean;
  pending: boolean;
  pristine: boolean;
  status: FormControlStatus;
  touched: boolean;
  untouched: boolean;
  valid: boolean;
  errors: ValidationErrors | null;
  required: boolean;
}

export class FormFieldStoreService<T = unknown> {
  private compRef: {
    formField?: FormFieldComponent;
    input?: InputComponent;
    textArea?: TextareaComponent;
    select?: SelectComponent<T>;
    chipList?: ChipListComponent;
  } = {};

  private has = {
    formField: signal(false),
    input: signal(false),
    textarea: signal(false),
    select: signal(false),
    chipList: signal(false),
  };

  private changeDetectorRefs = new Set<ChangeDetectorRef>();

  private ngControl?: AbstractControl<T> | undefined;
  private controllerReadySubject$ = new Subject<AbstractControl<T>>();

  private __markForCheckOnControlStatusChange = this.controllerReadySubject$
    .pipe(
      switchMap((control) => control.events),
      takeUntilDestroyed()
    )
    .subscribe(() => {
      this.changeDetectorRefs.forEach((cd) => cd.markForCheck());
    });

  public controlStatus$: Observable<DeepNullable<ControllerStore<T>>> = this.controllerReadySubject$.pipe(
    switchMap((control) => control.events.pipe(startWith({ source: this.ngControl }))),
    map((event) => {
      const control = event.source as AbstractControl<T>;
      return {
        value: control.value,
        dirty: control.dirty,
        enabled: control.enabled,
        disabled: control.disabled,
        invalid: control.invalid,
        pending: control.pending,
        pristine: control.pristine,
        status: control.status,
        touched: control.touched,
        untouched: control.untouched,
        valid: control.valid,
        errors: control.errors,
        required: control.hasValidator(Validators.required),
      };
    }),
    takeUntilDestroyed()
  );

  public control = toDeepSignal(
    toSignal(this.controlStatus$, {
      initialValue: {
        value: null as T,
        dirty: null,
        enabled: null,
        disabled: null,
        invalid: null,
        pending: null,
        pristine: null,
        status: null,
        touched: null,
        untouched: null,
        valid: null,
        errors: null,
        required: null,
      } as DeepNullable<ControllerStore<T>>,
    })
  );

  private error = {
    components: signal<ErrorComponent[]>([]),
  };

  public chipList = {
    disabled: computed(() => (this.has.chipList() && this.compRef.chipList ? this.compRef.chipList.disabled() : null)),
    size: computed(() => (this.has.chipList() && this.compRef.chipList ? this.compRef.chipList._size() : null)),
  };

  public select = {
    disabled: computed(() => (this.has.select() && this.compRef.select ? this.compRef.select.disabled() : null)),
    required: computed(() => (this.has.select() && this.compRef.select ? this.compRef.select._required() : null)),
  };

  public textarea = {
    disabled: computed(() => (this.has.textarea() && this.compRef.textArea ? this.compRef.textArea.disabled() : null)),
    required: computed(() => (this.has.textarea() && this.compRef.textArea ? this.compRef.textArea._required() : null)),
    focused: computed(() => (this.has.textarea() && this.compRef.textArea ? this.compRef.textArea._focused() : null)),
  };

  public input = {
    disabled: computed(() => (this.has.input() && this.compRef.input ? this.compRef.input.disabled() : null)),
    required: computed(() => (this.has.input() && this.compRef.input ? this.compRef.input._required() : null)),
    focused: computed(() => (this.has.input() && this.compRef.input ? this.compRef.input._focused() : null)),
  };

  public formField = {
    disabled: computed(() =>
      this.has.formField() && this.compRef.formField ? this.compRef.formField.disabled() : null
    ),
    hideRequiredMarker: computed(() =>
      this.has.formField() && this.compRef.formField ? this.compRef.formField.hideRequiredMarker() : null
    ),
    wrapperElem: computed(() =>
      this.has.formField() && this.compRef.formField ? this.compRef.formField._wrapperElemRef() : null
    ),
    size: computed(() => (this.has.formField() && this.compRef.formField ? this.compRef.formField._size() : null)),
  };

  private disabled = computed(
    () =>
      this.input.disabled() ??
      this.textarea.disabled() ??
      this.select.disabled() ??
      this.chipList.disabled() ??
      this.formField.disabled() ??
      this.control.disabled() ??
      false
  );

  public state = {
    disabled: this.disabled,
    hasInput: this.has.input.asReadonly(),
    hasTextarea: this.has.textarea.asReadonly(),
    hasSelect: this.has.select.asReadonly(),
    hasChipList: this.has.chipList.asReadonly(),

    hideRequiredMarker: computed(() => this.formField.hideRequiredMarker() ?? false),
    required: computed(
      () =>
        this.input.required() ?? this.textarea.required() ?? this.select.required() ?? this.control.required() ?? false
    ),
    focused: computed(() => {
      return this.disabled() ? false : (this.input.focused() ?? this.textarea.focused());
    }),
    hasError: computed(() => {
      if (this.control.invalid() && this.control.touched()) {
        return true;
      }

      return this.error.components().some((component) => component.force());
    }),
  };

  // Control
  public setController(ngControl: AbstractControl<T>) {
    this.ngControl = ngControl;
    this.controllerReadySubject$.next(ngControl);
  }

  // Error Component
  public registerErrorComponent(errorComp: ErrorComponent) {
    this.error.components.update((components) => [...components, errorComp]);
  }

  public unregisterErrorComponent(errorComp: ErrorComponent) {
    this.error.components.update((components) => components.filter((component) => component !== errorComp));
  }

  public registerComponent(name: 'formField', ref: FormFieldComponent, cd?: ChangeDetectorRef): void;
  public registerComponent(name: 'input', ref: InputComponent, cd?: ChangeDetectorRef): void;
  public registerComponent(name: 'textarea', ref: TextareaComponent, cd?: ChangeDetectorRef): void;
  public registerComponent(name: 'select', ref: SelectComponent, cd?: ChangeDetectorRef): void;
  public registerComponent(name: 'chipList', ref: ChipListComponent, cd?: ChangeDetectorRef): void;
  public registerComponent(
    name: 'formField' | 'input' | 'textarea' | 'select' | 'chipList',
    componentRef: FormFieldComponent | InputComponent | TextareaComponent | SelectComponent<T> | ChipListComponent,
    cd?: ChangeDetectorRef
  ) {
    this.compRef = { ...this.compRef, [name]: componentRef };
    this.has[name].set(true);
    if (cd) {
      this.changeDetectorRefs.add(cd);
    }
  }

  public unregisterComponent(
    componentRef: FormFieldComponent | InputComponent | TextareaComponent | SelectComponent | ChipListComponent,
    cd?: ChangeDetectorRef
  ) {
    this.compRef = recordReduceMerge(this.compRef, (ref, name) => {
      return ref === componentRef ? null : { [name]: ref };
    });

    if (cd) {
      this.changeDetectorRefs.delete(cd);
    }
  }
}
