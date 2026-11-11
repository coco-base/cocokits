import {
  Directive,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  model,
  output,
  viewChild,
  type Signal,
} from '@angular/core';
import type { FormCheckboxControl } from '@angular/forms/signals';
import { IdGenerator, injectFormParticipation } from '@cocokits/angular-core';
import { CckFormControlBase, type FormControlParts } from '@cocokits/angular/form-control';
import type { CheckboxParts, CheckboxProps } from '@cocokits/machines/checkbox';
import type { ChangeDetails, ValueChangeDetails } from '@cocokits/shared';
import { hasAccessibleName } from '@cocokits/utils';

/**
 * Why the checked value of a checkbox or switch changed.
 * @cckValue 'user' - The user turned the control on or off.
 * @cckValue 'form-reset' - The form that holds the control was reset.
 */
export type CheckControlChangeReason = 'user' | 'form-reset';

/**
 * The `reason` and the `event` of a change. The `checkedChangeDetails` output sends them with the `value`.
 */
export type CheckControlChangeDetails = ChangeDetails<CheckControlChangeReason>;

/**
 * What a check control needs from its machine: the root, the input, the label and the report for the field.
 * @internal
 */
export type CheckControlParts = Pick<CheckboxParts, 'root' | 'input' | 'label'> & FormControlParts;

/**
 * The control contract that `CckCheckbox` and `CckSwitch` share: the checked model, the change output, the
 * form participation and the host bindings; the model-free part is `CckFormControlBase`. A subclass adds its
 * selector, its template (the native input, `#input`, and the label, `#label`, inside it), its machine call
 * (`parts`) and what is its own (the Checkbox's `indeterminate`).
 *
 * The host is the root; the control attributes (`id`, `name`, `aria-*`) belong to the native input in the
 * template, so the host renders none of them.
 *
 * Not for direct use or extension outside CocoKits: it is exported only because the Checkbox and the Switch are
 * separate entry points and cannot share a relative file. Its members are the members of both components, so
 * changing one weighs as the same change on both.
 * @internal
 */
@Directive({
  host: {
    '[attr.id]': 'null',
    '[attr.name]': 'null',
    '[attr.form]': 'null',
    '[attr.aria-label]': 'null',
    '[attr.aria-labelledby]': 'null',
    '[attr.aria-describedby]': 'null',
    '[attr.data-checked]': 'parts().root["data-checked"]',
    '[attr.data-indeterminate]': 'parts().root["data-indeterminate"]',
  },
})
export abstract class CckCheckControlBase extends CckFormControlBase implements FormCheckboxControl {
  private readonly idGenerator = inject(IdGenerator);
  protected readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('input');
  private mountValue = false;

  protected readonly participation = injectFormParticipation({
    getChecked: () => this.parts().input.checked,
    element: () => this.inputRef()?.nativeElement,
    onReset: (event) => {
      this.onNativeReset(event);
    },
  });

  // The id has no signal dependency: it is a computed only so that `idPrefix`, set by the subclass after this
  // class is constructed, is read when the id is first needed.
  private readonly generatedId = computed(() => this.idGenerator.getId(this.idPrefix));

  /** The class of the block, the start of a generated input id. */
  protected abstract readonly idPrefix: string;

  /**
   * Whether the control is checked. Use `[(checked)]` to read and change it.
   * @remarks A `null` or `undefined` value shows the control unchecked and emits no change. With a one-way `[checked]`, a click changes the control but not your value. A plain `checked` attribute does not check the control, so write `[checked]="true"`.
   * @defaultValue false
   */
  readonly checked = model(false);

  /**
   * Emits after the user turns the control on or off, and after a form reset. It sends the new `value`, the `reason` and the `event`.
   * @remarks It never emits when the parent or a forms library changes `checked`.
   * @example
   * <!-- A cck-switch takes the same binding. -->
   * <cck-checkbox (checkedChangeDetails)="onChange($event.value, $event.reason)">Accept the terms</cck-checkbox>
   * <!-- In the class: onChange(checked: boolean, reason: CheckboxChangeReason) { console.log(checked, reason); } -->
   * @cckSemantic *.checkedChange
   */
  readonly checkedChangeDetails = output<ValueChangeDetails<boolean, CheckControlChangeReason>>();

  /**
   * The `id` of the native input. When not set, the input gets `<fieldId>-control` inside a form field, or a generated id outside one.
   */
  readonly id = input<string | undefined>(undefined);

  /**
   * The accessible name of the native input, as `aria-label`. When not set, the content you write inside the control names it.
   * @cckSemantic *.ariaLabel
   */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

  /**
   * The ids of the elements that name the native input, as `aria-labelledby`. When not set, the content you write inside the control names it.
   * @cckSemantic *.ariaLabelledBy
   */
  readonly ariaLabelledBy = input<string | undefined>(undefined, { alias: 'aria-labelledby' });

  /**
   * The value that `FormData` sends while the control is checked. When not set, the browser sends `on`.
   * @remarks The name is `submitValue` because Signal Forms does not allow a `value` binding on a control with a `checked` model.
   * @cckSemantic *.value
   * @cckParity Declared as an input.
   */
  readonly submitValue = input<string | undefined>(undefined);

  /**
   * The `id` of the form that the native input belongs to. Use it when the control is outside its form. When not set, the form around the control owns the input.
   * @cckSemantic none
   * @cckParity Declared as an input.
   */
  readonly form = input<string | undefined>(undefined);

  /** The machine props the control tracks. A subclass adds its own props to them when it calls its machine. */
  protected readonly state = computed<CheckboxProps>(() => ({
    checked: this.checked(),
    // The input always has an id, because the inner label needs one: the field's control id comes from the machine.
    id: this.id() ?? (this.fieldContext()?.ids ? undefined : this.generatedId()),
    ...this.facts(),
  }));

  /** The result of the subclass's machine call, from `state()` and `fieldContext()`. */
  protected abstract override readonly parts: Signal<CheckControlParts>;

  constructor() {
    super();
    afterNextRender(() => {
      this.mountValue = this.parts().input.checked;
      this.warnWithoutName();
    });
  }

  /** Whether the control shows the mixed state; only the Checkbox does. The prop owns it. */
  protected isMixed(): boolean {
    return false;
  }

  /** A click on the input. While read-only it cancels the activation, so the browser restores the state. */
  protected onClick(event: Event): void {
    if (this.parts().input['aria-readonly'] === 'true') event.preventDefault();
  }

  protected onChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.checked.set(input.checked);
    this.dirtyState.set(true);
    this.checkedChangeDetails.emit({ value: input.checked, reason: 'user', event });
    input.indeterminate = this.isMixed(); // the browser clears the mixed state on a click; the prop owns it
  }

  protected controlElement(): HTMLElement | undefined {
    return this.inputRef()?.nativeElement;
  }

  protected restoreMount(event: Event): void {
    this.checked.set(this.mountValue);
    this.checkedChangeDetails.emit({ value: this.mountValue, reason: 'form-reset', event });
  }

  /** Development only: warns when nothing names the input. */
  private warnWithoutName(): void {
    if (typeof ngDevMode !== 'undefined' && !ngDevMode) return;
    const input = this.inputRef()?.nativeElement;
    if (input && !hasAccessibleName(input)) {
      console.warn(
        'CocoKits: a Checkbox or Switch has no accessible name. Put the caption text inside it, or add an aria-label, a title, an aria-labelledby that points to an element with text, or a <label for> with text that points at its id.',
      );
    }
  }
}
