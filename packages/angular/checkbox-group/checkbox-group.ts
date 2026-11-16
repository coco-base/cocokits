import {
  Directive,
  afterNextRender,
  computed,
  input,
  model,
  output,
  signal,
  untracked,
  type Signal,
} from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { themeAttrs, type FormParticipationBinding } from '@cocokits/angular-core';
import { CCK_CONTROL_GROUP, CckFormControlBase, type FormControlParts } from '@cocokits/angular/form-control';
import {
  CHECKBOX_GROUP_NAME_WARNING,
  checkboxGroupAnatomy,
  getCheckboxGroupProps,
  toggleCheckboxGroupValue,
  type CheckboxGroupChangeReason as MachineChangeReason,
  type CheckboxGroupOrientation as MachineOrientation,
  type CheckboxGroupParts,
} from '@cocokits/machines/checkbox-group';
import type { ValueChangeDetails } from '@cocokits/shared';

/** Why the value of a Checkbox group changed. */
export type CheckboxGroupChangeReason = MachineChangeReason;

/** How the theme lays the checkboxes of a group out. */
export type CheckboxGroupOrientation = MachineOrientation;

/** What `valueChangeDetails` sends: the new `value`, the `reason` and the `event`. */
export type CheckboxGroupChangeDetails = ValueChangeDetails<readonly string[], CheckboxGroupChangeReason>;

/**
 * A group of checkboxes with one list of checked values. You write `cck-checkbox` elements inside it, each with a
 * `submitValue`. The group has `role="group"`.
 *
 * A checkbox inside the group is checked while its `submitValue` is in the `value` of the group. It takes the `name` and `disabled` of the group. The group works alone and inside a `cck-form-field`.
 *
 * Name the group. Inside a form field with a label, the label names it. Alone, give it `aria-label` or `aria-labelledby`. In development the group warns while nothing names it.
 *
 * The value is a model. Use `[(value)]` to read and change it. The group works with Signal Forms. Through `ngNoCva` it also works with `formControlName`, `[formControl]` and `ngModel`. The checkboxes are native inputs, so `FormData`, `form` and form reset work. A form reset sets the value back to the value at the first render.
 *
 * @example
 * <cck-checkbox-group aria-label="Toppings" [(value)]="toppings">
 *   <cck-checkbox submitValue="ham">Ham</cck-checkbox>
 *   <cck-checkbox submitValue="olives">Olives</cck-checkbox>
 * </cck-checkbox-group>
 * @cckPart root
 * @cckSlot default - The `cck-checkbox` elements. When not set, the group is empty.
 */
@Directive({
  selector: 'cck-checkbox-group',
  exportAs: 'cckCheckboxGroup',
  providers: [{ provide: CCK_CONTROL_GROUP, useValue: true }],
  host: {
    '[attr.role]': '_parts().root.role',
    '[attr.id]': '_parts().root.id ?? null',
    '[attr.aria-label]': '_parts().root["aria-label"] ?? null',
    '[attr.aria-labelledby]': '_parts().root["aria-labelledby"] ?? null',
    '[attr.aria-describedby]': '_parts().root["aria-describedby"] ?? null',
    '[attr.data-disabled]': '_parts().root["data-disabled"] ?? null',
    '[attr.data-orientation]': '_parts().root["data-orientation"]',
    '[attr.name]': 'null',
    '[attr.disabled]': 'null',
    '[attr.readonly]': 'null',
    '[attr.required]': 'null',
    '[attr.orientation]': 'null',
    '[attr.value]': 'null',
  },
})
export class CckCheckboxGroup extends CckFormControlBase implements FormValueControl<readonly string[]> {
  /**
   * The `submitValue` of every checked checkbox, in the order they were checked.
   * @remarks A value that matches no checkbox is kept. Changing the value from code never emits `valueChangeDetails`.
   * @cckSemantic checkbox-group.value
   * @defaultValue []
   */
  readonly value = model<readonly string[]>([]);

  /**
   * Emits after the user checks or unchecks a checkbox, and after a form reset that changes the value. It sends the new `value`, the `reason` and the `event`.
   * @remarks It never emits when the parent or a forms library changes the value.
   * @example
   * <cck-checkbox-group aria-label="Toppings" (valueChangeDetails)="onChange($event)">
   *   <cck-checkbox submitValue="ham">Ham</cck-checkbox>
   * </cck-checkbox-group>
   * <!-- In the class: onChange(details: CheckboxGroupChangeDetails) { console.log(details.value, details.reason); } -->
   * @cckSemantic checkbox-group.valueChange
   */
  readonly valueChangeDetails = output<CheckboxGroupChangeDetails>();

  /**
   * The `id` of the group. When not set, the group gets `<fieldId>-control` inside a form field, or no id outside one.
   */
  readonly id = input<string | undefined>(undefined);

  /**
   * How the theme lays the checkboxes out. It only sets `data-orientation`; the group has no arrow-key navigation.
   * @cckSemantic checkbox-group.orientation
   * @defaultValue 'vertical'
   */
  readonly orientation = input<CheckboxGroupOrientation>('vertical');

  /**
   * The accessible name of the group, as `aria-label`. Inside a form field with a label, the label names the group instead.
   * @cckSemantic *.ariaLabel
   */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

  /**
   * The ids of the elements that name the group, as `aria-labelledby`. It wins over the label of the form field.
   * @cckSemantic *.ariaLabelledBy
   */
  readonly ariaLabelledBy = input<string | undefined>(undefined, { alias: 'aria-labelledby' });

  /** The theme attributes of every part; the root's are applied to the host. @internal */
  readonly _theme = themeAttrs(checkboxGroupAnatomy);

  // A group has no native control: the checkboxes inside it are the native inputs and take part in the form.
  protected readonly participation: FormParticipationBinding = {
    fieldsetDisabled: signal(false).asReadonly(),
    submitted: signal(false).asReadonly(),
    syncValue: () => undefined,
    clearSubmitted: () => undefined,
  };

  private mountValue: readonly string[] = [];
  private lastReset: Event | undefined;

  /** The root props, what the group gives each checkbox, and the report for the field. @internal */
  readonly _parts: Signal<CheckboxGroupParts> = computed(() =>
    getCheckboxGroupProps(
      {
        ...this.facts(),
        id: this.id(),
        value: this.value(),
        orientation: this.orientation(),
        ariaLabel: this.ariaLabel(),
        ariaLabelledBy: this.ariaLabelledBy(),
      },
      this.fieldContext(),
    ),
  );

  protected readonly parts: Signal<FormControlParts> = this._parts;

  constructor() {
    super();
    afterNextRender(() => {
      this.mountValue = untracked(this.value);
      if (typeof ngDevMode !== 'undefined' && !ngDevMode) return;
      if (!untracked(this._parts).named) console.warn(CHECKBOX_GROUP_NAME_WARNING);
    });
  }

  /**
   * A checkbox was checked or unchecked by the user: updates the value and emits once.
   *
   * @param item - The `submitValue` of the checkbox.
   * @param checked - Whether the checkbox is now checked.
   * @param event - The native `change` event.
   * @internal
   */
  _userChanged(item: string, checked: boolean, event: Event): void {
    const next = toggleCheckboxGroupValue(this.value(), item, checked);
    if (next === this.value()) return;
    this.value.set(next);
    this.dirtyState.set(true);
    this.valueChangeDetails.emit({ value: next, reason: 'user', event });
  }

  /**
   * The owner form was reset: restores the value the group had at mount and emits once when it changes. Every
   * checkbox reports the same reset, so the event is remembered.
   *
   * @param event - The `reset` event.
   * @internal
   */
  _formReset(event: Event): void {
    if (this.lastReset === event) return;
    this.lastReset = event;
    this.touchedState.set(false);
    this.dirtyState.set(false);
    if (this.value() === this.mountValue) return;
    this.value.set(this.mountValue);
    this.valueChangeDetails.emit({ value: this.mountValue, reason: 'form-reset', event });
  }

  protected controlElement(): HTMLElement | null {
    return null;
  }

  protected restoreMount(): void {
    // The checkboxes inside report a form reset through `_formReset`.
  }
}
