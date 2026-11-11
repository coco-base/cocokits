import { Component, ViewEncapsulation, computed } from '@angular/core';
import { CckAttrs, themeAttrs } from '@cocokits/angular-core';
import {
  CckCheckControlBase,
  type CheckControlChangeDetails,
  type CheckControlChangeReason,
} from '@cocokits/angular/checkbox';
import { getSwitchProps, switchAnatomy } from '@cocokits/machines/switch';

/** Why the checked value of a Switch changed. */
export type SwitchChangeReason = CheckControlChangeReason;

/** The `reason` and the `event` of a change. The `checkedChangeDetails` output sends them with the `value`. */
export type SwitchChangeDetails = CheckControlChangeDetails;

/**
 * A switch that turns one setting on or off. It wraps a native `<input type="checkbox" role="switch">` on a track. The content you write inside it becomes the label, next to the track.
 *
 * The switch works with Signal Forms through `[formField]`. Through `ngNoCva` it also works with `formControlName`, `[formControl]` and `ngModel`. The native input is the form control, so `FormData`, `required`, form reset and a disabled `fieldset` work as usual.
 *
 * Inside a `cck-form-field`, the input gets the id `<fieldId>-control`, and the label of the field points at it. The input is described by the hints and errors of the field. `aria-invalid` shows only after the user has left the control or has tried to submit the form.
 *
 * @example
 * <cck-switch [(checked)]="notifications">Notifications</cck-switch>
 * @cckPart root
 * @cckPart label
 * @cckPart track
 * @cckPart input
 * @cckPart thumb
 * @cckPart backdrop
 * @cckSlot default - The text of the label. When not set, the label is empty, so name the switch with `aria-label`.
 */
@Component({
  selector: 'cck-switch',
  exportAs: 'cckSwitch',
  encapsulation: ViewEncapsulation.None,
  imports: [CckAttrs],
  template: `
    <label #label [class]="parts().label.class" [cckAttrs]="theme().label" [attr.for]="parts().label.for">
      <span [class]="parts().track.class" [cckAttrs]="theme().track">
        <input
          #input
          [attr.type]="parts().input.type"
          [attr.role]="parts().input.role"
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
          [class]="parts().thumb.class"
          [attr.aria-hidden]="parts().thumb['aria-hidden']"
          [cckAttrs]="theme().thumb"
        ></span>
        <span
          [class]="parts().backdrop.class"
          [attr.aria-hidden]="parts().backdrop['aria-hidden']"
          [cckAttrs]="theme().backdrop"
        ></span>
      </span>
      <ng-content />
    </label>
  `,
})
export class CckSwitch extends CckCheckControlBase {
  protected readonly idPrefix = switchAnatomy.classes.root;

  /** The theme attributes of every part; the root's are applied to the host. */
  protected readonly theme = themeAttrs(switchAnatomy);

  protected readonly parts = computed(() => getSwitchProps(this.state(), this.fieldContext()));
}
