import { Component, ViewEncapsulation, computed } from '@angular/core';
import { CckAttrs, themeAttrs } from '@cocokits/angular-core';
import {
  CckCheckControlBase,
  type CheckControlChangeDetails,
  type CheckControlChangeReason,
} from '@cocokits/angular/checkbox';
import { getSwitchProps, switchAnatomy } from '@cocokits/machines/switch';

/** Why the checked value of a Switch changed: the user toggled it (`'user'`) or the form was reset (`'form-reset'`). */
export type SwitchChangeReason = CheckControlChangeReason;

/** The `reason` and `event` of a change. The `checkedChangeDetails` output emits them with the `value`. */
export type SwitchChangeDetails = CheckControlChangeDetails;

/**
 * A switch: a native `<input type="checkbox" role="switch">` on a track, with its label. It is the Checkbox
 * without the mixed state, and everything the Checkbox says about forms, the FormField, `submitValue` and
 * `checked` applies. The host is the root (a `<div>` by default) and the content you write becomes the label,
 * next to the track.
 *
 * @example
 * <div cckSwitch [(checked)]="notifications">Notifications</div>
 * @cckPart root
 * @cckPart label
 * @cckPart track
 * @cckPart input
 * @cckPart thumb
 * @cckPart backdrop
 * @cckSlot default - The label content.
 */
@Component({
  selector: '[cckSwitch]',
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

  /** The label wraps the track, so the node that holds the input is not the author's content. */
  protected override labelTrackNodes(): readonly ChildNode[] {
    return Array.from(this.labelRef()?.nativeElement.childNodes ?? []).filter(
      (node) => node instanceof HTMLElement && node.contains(this.inputRef()?.nativeElement ?? null),
    );
  }
}
