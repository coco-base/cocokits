import {
  DestroyRef,
  Directive,
  afterEveryRender,
  booleanAttribute,
  computed,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  type Signal,
} from '@angular/core';
import { AbstractControl, FormResetEvent, NgControl } from '@angular/forms';
import type { DisabledReason, ValidationError, WithOptionalFieldTree } from '@angular/forms/signals';
import type { FormParticipationBinding } from '@cocokits/angular-core';
import { CckFormField } from '@cocokits/angular/form-field';
import type {
  FormFieldControlContext,
  FormFieldControlProps,
  FormFieldControlRootProps,
  FormFieldControlState,
} from '@cocokits/machines/form-field';
import type { Subscription } from 'rxjs';

/** What a form control needs from its machine: the facts on its root, and the report for the field. */
export interface FormControlParts {
  readonly root: Partial<
    Pick<
      FormFieldControlRootProps,
      | 'hidden'
      | 'data-disabled'
      | 'data-readonly'
      | 'data-required'
      | 'data-invalid'
      | 'data-pending'
      | 'data-touched'
      | 'data-dirty'
      | 'data-submitted'
      | 'data-focused'
    >
  > & { readonly class: string };
  readonly control: FormFieldControlState;
}

/** The facts every form control tracks and gives its machine: everything but the id and the model. */
export type FormControlFacts = Omit<FormFieldControlProps, 'id' | 'filled'>;

/**
 * The part of a form control that does not depend on its model: the Signal Forms state inputs, the touched,
 * dirty, submitted and focused facts, the report to the enclosing FormField, and the tracking of a bound forms
 * library. `CckTextControlBase` (text) and `CckCheckControlBase` (checkbox, switch) extend it and add their
 * model, change output, participation, machine call and element.
 *
 * Not for direct use or extension outside CocoKits: it is exported only because the controls are separate
 * entry points and cannot share a relative file. Its members are the members of every control, so changing
 * one weighs as the same change on all of them.
 */
@Directive({
  host: {
    ngNoCva: '',
    '[class]': 'parts().root.class',
    '[attr.hidden]': 'parts().root.hidden ? "" : null',
    '[attr.data-disabled]': 'parts().root["data-disabled"]',
    '[attr.data-readonly]': 'parts().root["data-readonly"]',
    '[attr.data-required]': 'parts().root["data-required"]',
    '[attr.data-invalid]': 'parts().root["data-invalid"]',
    '[attr.data-pending]': 'parts().root["data-pending"]',
    '[attr.data-touched]': 'parts().root["data-touched"]',
    '[attr.data-dirty]': 'parts().root["data-dirty"]',
    '[attr.data-submitted]': 'parts().root["data-submitted"]',
    '[attr.data-focused]': 'parts().root["data-focused"]',
  },
})
export abstract class CckFormControlBase {
  private readonly ngControl = inject(NgControl, { self: true, optional: true });
  protected readonly field = inject(CckFormField, { optional: true });
  private readonly control = this.field?._register(() => this.controlElement());
  private watched: AbstractControl | undefined;
  private resetWatch: Subscription | undefined;

  /**
   * Emits when the user leaves the control; forms libraries mark the control touched from it.
   * @cckSemantic none
   * @remarks Angular's `FormUiControl` output.
   */
  readonly touch = output();

  /**
   * The ids this control is described by (`aria-describedby`). Inside a field the feedback wrapper id is
   * added after them.
   * @cckSemantic *.ariaDescribedBy
   */
  readonly ariaDescribedBy = input<string | undefined>(undefined, { alias: 'aria-describedby' });

  /**
   * The `name` that `FormData` submits. Signal Forms writes its field name into it. Left out, it is the
   * path of the bound forms control joined with `.`, and none without a forms library.
   * @cckSemantic none
   * @remarks React and Vue take the native `name` attribute; only Angular forms put the name on a directive.
   * @defaultValue ''
   */
  readonly name = input('');

  /**
   * Whether the control is disabled. A disabling `fieldset` and the field's `disabled` add to it.
   * @defaultValue false
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  /**
   * Whether the control is read-only; it stays focusable.
   * @cckSemantic *.readOnly
   * @defaultValue false
   */
  readonly readonly = input(false, { transform: booleanAttribute });

  /**
   * Whether the control is required (native `required`).
   * @defaultValue false
   */
  readonly required = input(false, { transform: booleanAttribute });

  /**
   * Whether the control is invalid. `aria-invalid` waits for `touched` or `submitted`.
   * @defaultValue false
   */
  readonly invalid = input(false, { transform: booleanAttribute });

  /**
   * Whether an asynchronous validator is running.
   * @defaultValue false
   */
  readonly pending = input(false, { transform: booleanAttribute });

  /**
   * Whether the control is hidden (native `hidden`). Signal Forms writes it; render a hidden field with
   * `@if` instead.
   * @cckSemantic none
   * @remarks React and Vue take the native `hidden` attribute.
   * @defaultValue false
   */
  readonly hidden = input(false, { transform: booleanAttribute });

  /**
   * Whether the user left the control. A forms library writes it; a value that is given wins, otherwise it
   * is set after the first blur.
   */
  readonly touched = input(false, { transform: booleanAttribute });

  /**
   * Whether the user changed the control. A forms library writes it; a value that is given wins, otherwise
   * it is set after the first change.
   */
  readonly dirty = input(false, { transform: booleanAttribute });

  /**
   * Whether a submit of the owner form was attempted. A value that is given wins, also `false`; otherwise
   * a `submit` event of the form (canceled ones included) sets it and a reset clears it.
   */
  readonly submitted = input<boolean | undefined, unknown>(undefined, {
    transform: (value) => (value === undefined ? undefined : booleanAttribute(value)),
  });

  /**
   * The validation errors a forms library writes. The control and the FieldError render nothing
   * from them.
   * @cckSemantic none
   * @remarks Angular's `FormUiControl` input.
   * @defaultValue []
   */
  readonly errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);

  /**
   * The reasons the control is disabled, written by Signal Forms. The control renders nothing.
   * @cckSemantic none
   * @remarks Angular's `FormUiControl` input.
   * @defaultValue []
   */
  readonly disabledReasons = input<readonly WithOptionalFieldTree<DisabledReason>[]>([]);

  /** Whether the control has focus. */
  protected readonly focused = signal(false);
  protected readonly touchedState = linkedSignal(() => this.touched());
  protected readonly dirtyState = linkedSignal(() => this.dirty());
  private readonly submittedState = linkedSignal(() => this.participation.submitted());
  private readonly submittedFact = computed(() => this.submitted() ?? this.submittedState());

  /** The facts the control gives its machine; a subclass adds its id and its model to them. */
  protected readonly facts = computed<FormControlFacts>(() => ({
    ariaDescribedBy: this.ariaDescribedBy(),
    name: this.name(),
    controlPath: this.controlPath(),
    disabled: this.disabled() || this.participation.fieldsetDisabled(),
    readOnly: this.readonly(),
    required: this.required(),
    invalid: this.invalid(),
    pending: this.pending(),
    touched: this.touchedState(),
    dirty: this.dirtyState(),
    submitted: this.submittedFact(),
    focused: this.focused(),
    hidden: this.hidden(),
  }));

  /** The input wrapper of the enclosing FormField, when this is its control; overlays line up with it. */
  protected readonly fieldAnchor = computed(() => this.control?.anchor() ?? null);

  /** What the enclosing FormField gives the control; none outside a field. */
  protected readonly fieldContext = computed<FormFieldControlContext | undefined>(() => {
    const field = this.field;
    return field ? { ids: this.control?.primary ? field._ids() : undefined, state: field._fieldInput() } : undefined;
  });

  /** The result of the subclass's machine call, from its state and `fieldContext()`. */
  protected abstract readonly parts: Signal<FormControlParts>;

  /** The native participation of the control (`injectFormParticipation`), created by the subclass. */
  protected abstract readonly participation: FormParticipationBinding;

  constructor() {
    this.control?.report(computed(() => this.parts().control));
    afterEveryRender({
      read: () => {
        this.watchControl();
      },
    });
    inject(DestroyRef).onDestroy(() => {
      this.resetWatch?.unsubscribe();
    });
  }

  /**
   * Focuses the control. Signal Forms calls it to focus an invalid field.
   * @cckSemantic none
   * @remarks Angular's `FormUiControl` method.
   */
  focus(options?: FocusOptions): void {
    this.controlElement()?.focus(options);
  }

  /**
   * Clears the touched, dirty and submitted facts the control keeps itself. Signal Forms calls it on `reset()`.
   * @cckSemantic none
   * @remarks Angular's `FormUiControl` method.
   */
  reset(): void {
    this.touchedState.set(false);
    this.dirtyState.set(false);
    this.clearSubmitted();
  }

  /** The native element that takes focus and that the FormField focuses; it may not exist yet. */
  protected abstract controlElement(): HTMLElement | null | undefined;

  /** Writes the model the control had at mount back and emits it with the reason `'form-reset'`. */
  protected abstract restoreMount(event: Event): void;

  protected onBlur(): void {
    this.focused.set(false);
    this.touchedState.set(true);
    this.touch.emit();
  }

  /**
   * After an uncanceled reset of the owner form. A bound forms library owns the value and resets its
   * control itself; the control only has to show it (the participation writes the model to the DOM next).
   */
  protected onNativeReset(event: Event): void {
    if (this.ngControl) return;
    this.touchedState.set(false);
    this.dirtyState.set(false);
    this.restoreMount(event);
  }

  /** The path of the bound forms control, or `null` when there is none or a segment has no name. */
  private controlPath(): readonly (string | number)[] | null {
    const path = this.ngControl?.path;
    const named = path?.every((segment) => typeof segment === 'string' || typeof segment === 'number');
    return named && path ? path : null;
  }

  private clearSubmitted(): void {
    this.submittedState.set(false);
    this.participation.clearSubmitted();
  }

  /**
   * Follows the reset events of the bound `FormControl`, which fire for `FormControl.reset()`,
   * `FormGroup.reset()` and `resetForm()` and not as DOM events. The control can change, so it is checked
   * after every render.
   */
  private watchControl(): void {
    const control = this.ngControl?.control;
    const next = control instanceof AbstractControl ? control : undefined;
    if (next === this.watched) return;
    this.watched = next;
    this.resetWatch?.unsubscribe();
    this.resetWatch = next?.events.subscribe((event) => {
      if (event instanceof FormResetEvent) this.clearSubmitted();
    });
  }
}
