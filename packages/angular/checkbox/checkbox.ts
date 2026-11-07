import { Component, ViewEncapsulation, afterRenderEffect, booleanAttribute, computed, input } from '@angular/core';
import { CckAttrs, themeAttrs } from '@cocokits/angular-core';
import { checkboxAnatomy, getCheckboxProps } from '@cocokits/machines/checkbox';
import {
  CckCheckControlBase,
  type CheckControlChangeDetails,
  type CheckControlChangeReason,
} from './check-control-base';

/** Why the checked value of a Checkbox changed: the user toggled it (`'user'`) or the form was reset (`'form-reset'`). */
export type CheckboxChangeReason = CheckControlChangeReason;

/** The `reason` and `event` of a change. The `checkedChangeDetails` output emits them with the `value`. */
export type CheckboxChangeDetails = CheckControlChangeDetails;

/**
 * A checkbox around a native `<input type="checkbox">` with its label. The host is the root (a `<div>` by
 * default) and the content you write becomes the label. It is a Signal Forms checkbox control
 * (`[formField]` binds `checked`) and, through the static `ngNoCva` attribute, also binds to
 * `formControlName`, `[formControl]` and `ngModel` with no ControlValueAccessor. The input is the form control,
 * so `FormData`, `required`, reset, the `form` attribute and `fieldset[disabled]` are native.
 *
 * Inside a `cck-form-field` the input gets the id `<fieldId>-control`, the field label's `for` points at it
 * and its `aria-describedby` ends with the ids of the field's hints, then of its errors. `name` defaults to the path of the bound
 * forms control. `aria-invalid="true"` appears only while the control is invalid and was touched or the form was
 * submitted. Use `submitValue` for the value the form submits (Signal Forms rejects a `value` binding here).
 *
 * `indeterminate` is one-way: the component never changes it. A parent that owns the mixed state recomputes it
 * in its `checkedChangeDetails` handler.
 *
 * @example
 * <cck-checkbox [(checked)]="accepted">Accept the terms</cck-checkbox>
 * @cckPart root
 * @cckPart wrapper
 * @cckPart inputWrapper
 * @cckPart input
 * @cckPart backdrop
 * @cckPart background
 * @cckPart label
 * @cckSlot default - The label content.
 */
@Component({
  selector: 'cck-checkbox',
  exportAs: 'cckCheckbox',
  encapsulation: ViewEncapsulation.None,
  imports: [CckAttrs],
  template: `
    <span [class]="parts().wrapper.class" [cckAttrs]="theme().wrapper">
      <span [class]="parts().inputWrapper.class" [cckAttrs]="theme().inputWrapper">
        <input
          #input
          [attr.type]="parts().input.type"
          [class]="parts().input.class"
          [cckAttrs]="theme().input"
          [attr.id]="parts().input.id"
          [attr.name]="parts().input.name"
          [attr.value]="submitValue() ?? null"
          [attr.form]="form() ?? null"
          [checked]="parts().input.checked"
          [attr.checked]="parts().input.checked ? '' : null"
          [attr.disabled]="parts().input.disabled ? '' : null"
          [attr.required]="parts().input.required ? '' : null"
          [attr.aria-readonly]="parts().input['aria-readonly']"
          [attr.aria-invalid]="parts().input['aria-invalid']"
          [attr.aria-describedby]="parts().input['aria-describedby']"
          [attr.aria-label]="ariaLabel() ?? null"
          [attr.aria-labelledby]="ariaLabelledBy() ?? null"
          (click)="onClick($event)"
          (change)="onChange($event)"
          (focus)="focused.set(true)"
          (blur)="onBlur()"
        />
        <span
          [class]="parts().backdrop.class"
          [attr.aria-hidden]="parts().backdrop['aria-hidden']"
          [cckAttrs]="theme().backdrop"
        ></span>
        <span
          [class]="parts().background.class"
          [attr.aria-hidden]="parts().background['aria-hidden']"
          [cckAttrs]="theme().background"
        ></span>
      </span>
      <label #label [class]="parts().label.class" [cckAttrs]="theme().label" [attr.for]="parts().label.for">
        <ng-content />
      </label>
    </span>
  `,
})
export class CckCheckbox extends CckCheckControlBase {
  protected readonly idPrefix = checkboxAnatomy.classes.root;

  /**
   * Whether the checkbox shows the mixed state. One-way: the component never changes it and never emits for
   * it. `data-indeterminate` renders on the server; the DOM property is set after mount.
   * @defaultValue false
   */
  readonly indeterminate = input(false, { transform: booleanAttribute });

  /** The theme attributes of every part; the root's are applied to the host. */
  protected readonly theme = themeAttrs(checkboxAnatomy);

  protected readonly parts = computed(() =>
    getCheckboxProps({ ...this.state(), indeterminate: this.indeterminate() }, this.fieldContext()),
  );

  constructor() {
    super();
    afterRenderEffect(() => {
      const element = this.inputRef()?.nativeElement;
      if (element) element.indeterminate = this.indeterminate();
    });
  }

  protected override isMixed(): boolean {
    return this.indeterminate();
  }
}
