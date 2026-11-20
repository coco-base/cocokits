import {
  Component,
  ViewEncapsulation,
  afterRenderEffect,
  booleanAttribute,
  computed,
  inject,
  input,
} from '@angular/core';
import { CckAttrs, injectPartIconName, themeAttrs } from '@cocokits/angular-core';
import { CckCheckboxGroup } from '@cocokits/angular/checkbox-group';
import { CckSvgIcon } from '@cocokits/angular/svg-icon';
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
 * The caption text names the control. With no caption text, add `aria-label` or `aria-labelledby`, or a `<label for>` with text.
 *
 * The checkbox works with Signal Forms through `[formField]`. Through `ngNoCva` it also works with `formControlName`, `[formControl]` and `ngModel`. The native input is the form control, so `FormData`, `required`, form reset and a disabled `fieldset` work as usual.
 *
 * Inside a `cck-form-field`, the input gets the id `<fieldId>-control`, and the label of the field points at it. The input is described by the hints and errors of the field. `aria-invalid` shows only after the user has left the control or has tried to submit the form.
 *
 * Inside a `cck-checkbox-group`, the group owns the value. The checkbox is checked while its `submitValue` is in the `value` of the group. It takes the `name` and `disabled` of the group.
 *
 * The component never changes `indeterminate`. When you own the mixed state, set it again in your `checkedChangeDetails` handler.
 *
 * The tick in the background draws the icon your theme names in `components.checkbox.icons.background`, else the default `check`. Register a theme icon with `provideCckIcons`.
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
  imports: [CckAttrs, CckSvgIcon],
  host: { '[attr.indeterminate]': 'null' },
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
        >
          @if (parts().input.checked && !indeterminate()) {
            <cck-svg-icon [iconName]="tickIconName()" />
          }
        </span>
      </span>
      <label [class]="parts().label.class" [cckAttrs]="theme().label" [attr.for]="parts().label.for">
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

  /** The theme's icon when registered, else the default; the part shows it while checked and not indeterminate. */
  protected readonly tickIconName = injectPartIconName(checkboxAnatomy.block, 'background');

  /** The group the checkbox sits in, when it does. */
  private readonly group = inject(CckCheckboxGroup, { optional: true });

  protected readonly parts = computed(() => {
    const state = { ...this.state(), indeterminate: this.indeterminate() };
    const group = this.group;
    if (!group) return getCheckboxProps(state, this.fieldContext());
    const key = this.submitValue();
    const { name, disabled } = group._parts().checkbox;
    return getCheckboxProps(
      {
        ...state,
        checked: key !== undefined && group.value().includes(key),
        name: (state.name ?? '') === '' ? name : state.name,
        disabled: state.disabled === true || disabled === true,
      },
      this.fieldContext(),
    );
  });

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

  protected override onChange(event: Event): void {
    super.onChange(event);
    const key = this.submitValue();
    if (this.group && key !== undefined)
      this.group._userChanged(key, (event.target as HTMLInputElement).checked, event);
  }

  protected override restoreMount(event: Event): void {
    if (this.group) this.group._formReset(event);
    else super.restoreMount(event);
  }
}
