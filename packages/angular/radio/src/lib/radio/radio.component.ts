import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  model,
  output,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { _UiBaseComponent } from '@cocokits/angular-core';
import { TrustHtmlPipe } from '@cocokits/angular-utils';
import { toBooleanOrPresent } from '@cocokits/common-utils';

/**
 * To avoid get cycle dependencies, we have to create radio-group and radio-button in a single file.
 */

// Increasing integer for generating unique ids for checkbox components.
let NEXT_ID = 1;

export interface RadioChange<T> {
  /** The radio button that emits the change event. */
  source: RadioButtonComponent<T>;

  /** The value of the radio button. */
  value: T;
}

/**
 * Provider Expression that allows cck-radio-group to register as a ControlValueAccessor. This
 * allows it to support [(ngModel)] and ngControl.
 */
export const RADIO_GROUP_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => RadioGroupComponent),
  multi: true,
};

@Component({
  standalone: true,
  imports: [],
  selector: 'cck-radio-group',
  template: '<ng-content></ng-content>',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [RADIO_GROUP_CONTROL_VALUE_ACCESSOR],
  host: {
    '[class]': 'classNames().host',
  },
})
export class RadioGroupComponent<T = unknown> extends _UiBaseComponent<'radioGroup'> implements ControlValueAccessor {
  protected readonly componentName = 'radioGroup';
  protected extraHostElementClassConditions = computed(() => []);

  /** Name of the radio button group. All radio buttons inside this group will use this name. */
  public name = input<string>(`cck-radio-group-${NEXT_ID++}`);

  /** The currently selected radio button */
  public selected = model<T>();

  /** Whether the radio group is disabled */
  public _disabled = model<boolean | null>(null, { alias: 'disabled' });
  public disabled = computed(() => toBooleanOrPresent(this._disabled()));

  /**
   * Event emitted when the group value changes.
   * Change events are only emitted when the value changes due to user interaction with
   * a radio button (the same behavior as `<input type-"radio">`).
   */
  public readonly change = output<RadioChange<T>>();

  private selectedRadio = signal<RadioButtonComponent<T> | null>(null);

  private __onSelectedRadioChanged = effect(() => {
    const selectedRadio = this.selectedRadio();
    if (selectedRadio) {
      this.change.emit({ source: selectedRadio, value: selectedRadio.value() });
    }
  });

  /**
   * Will be called by radioButton component to set the selected.
   * @internal
   */
  public _setSelectedRadio(radio: RadioButtonComponent<T>) {
    this.selectedRadio.set(radio);
    this.selected.set(radio.value());
    this._controlValueAccessorChangeFn(radio.value());
  }

  /**
   * onTouch function registered via registerOnTouch (ControlValueAccessor).
   * @internal
   */
  onTouched: () => any = () => {
    // Do nothing
  };

  /**
   * The method to be called in order to update ngModel
   * @internal
   */
  _controlValueAccessorChangeFn: (value: any) => void = () => {
    // Do nothing
  };

  /**
   * Sets the model value. Implemented as part of ControlValueAccessor.
   * @internal
   */
  writeValue(value: T) {
    this.selected.set(value);
  }

  /**
   * Registers a callback to be triggered when the model value changes.
   * Implemented as part of ControlValueAccessor.
   * @param fn Callback to be registered.
   * @internal
   */
  registerOnChange(fn: (value: any) => void) {
    this._controlValueAccessorChangeFn = fn;
  }

  /**
   * Registers a callback to be triggered when the control is touched.
   * Implemented as part of ControlValueAccessor.
   * @param fn Callback to be registered.
   * @internal
   */
  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  /**
   * Sets the disabled state of the control. Implemented as a part of ControlValueAccessor.
   * @param isDisabled Whether the control should be disabled.
   * @internal
   */
  setDisabledState(isDisabled: boolean) {
    this._disabled.set(isDisabled);
  }
}

// To avoid circular dependency, we need to define both components in a single file.
@Component({
  standalone: true,
  imports: [TrustHtmlPipe],
  selector: 'cck-radio-button',
  templateUrl: './radio-button.component.html',
  styleUrls: ['./radio-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'hostClassNames()',
  },
})
export class RadioButtonComponent<T = unknown> extends _UiBaseComponent<'radioButton'> {
  protected readonly componentName = 'radioButton';
  protected extraHostElementClassConditions = computed(() => [
    { if: this.effectedChecked(), classes: this.classNames().checked },
    { if: !this.effectedChecked(), classes: this.classNames().unchecked },
    { if: this.effectedDisabled(), classes: this.classNames().disabled },
  ]);

  private radioGroup = inject(RadioGroupComponent<T>, { optional: true });

  override _effectedSize = computed(() => this.size() ?? this.radioGroup?.size());
  override _effectedColor = computed(() => this.color() ?? this.radioGroup?.color());
  override _effectedAdditional = computed(() => ({ ...this.additional(), ...this.radioGroup?.additional() }));

  /** Analog to HTML 'name' attribute used to group radios for unique selection. */
  public name = input<string>();

  protected effectedName = computed(() => this.name() || this.radioGroup?.name());

  /** Whether this radio button is checked. */
  public checked = model<boolean>();

  protected effectedChecked = computed(() =>
    this.radioGroup ? this.radioGroup.selected() === this.value() : this.checked()
  );

  /** The value of this radio button. */
  public value = input.required<T>();

  /** Whether the radio button is disabled. */
  public disabled = input<boolean>();

  protected effectedDisabled = computed(() => this.disabled() || this.radioGroup?.disabled());

  /** The unique ID for the radio button. If none is supplied, it will be auto-generated. */
  public id = input(`cck-radio-${NEXT_ID++}`);

  /**
   * Event emitted when the group value changes.
   * Change events are only emitted when the value changes due to user interaction with
   * a radio button (the same behavior as `<input type-"radio">`).
   */
  readonly change = output<RadioChange<T>>();

  /** Triggered when the radio button receives an interaction from the user. */
  protected _onInputChange(event: Event) {
    // We always have to stop propagation on the change event.
    // Otherwise, the change event, from the input element, will bubble up and
    // emit its event object to the `change` output.
    event.stopPropagation();

    this.change.emit({ source: this, value: this.value() });
    this.radioGroup?._setSelectedRadio(this);
    this.checked.set(true);
  }
}
