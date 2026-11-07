import { Component, ViewEncapsulation, afterRenderEffect, booleanAttribute, computed, input } from '@angular/core';
import { CckAttrs, themeAttrs } from '@cocokits/angular-core';
import { checkboxAnatomy, getCheckboxProps } from '@cocokits/machines/checkbox';
import {
  CckCheckControlBase,
  type CheckControlChangeDetails,
  type CheckControlChangeReason,
} from './check-control-base';

/** Why the checked value of a Checkbox changed. */
export type CheckboxChangeReason = CheckControlChangeReason;

/** The `reason` and the `event` of a change. The `checkedChangeDetails` output sends them with the `value`. */
export type CheckboxChangeDetails = CheckControlChangeDetails;

/**
 * A checkbox with its label. It wraps a native `<input type="checkbox">`. The content you write inside it becomes the label.
 *
 * The checkbox works with Signal Forms through `[formField]`. Through `ngNoCva` it also works with `formControlName`, `[formControl]` and `ngModel`. The native input is the form control, so `FormData`, `required`, form reset and a disabled `fieldset` work as usual.
 *
 * Inside a `cck-form-field`, the input gets the id `<fieldId>-control`, and the label of the field points at it. The input is described by the hints and errors of the field. `aria-invalid` shows only after the user has left the control or has tried to submit the form.
 *
 * The component never changes `indeterminate`. When you own the mixed state, set it again in your `checkedChangeDetails` handler.
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
 * @cckSlot default - The text of the label. When not set, the label is empty, so name the checkbox with `aria-label`.
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
   * Whether the checkbox shows the mixed state. The component never changes it and never emits for it.
   * @remarks `data-indeterminate` is rendered on the server too. The DOM property is set after the first render.
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
