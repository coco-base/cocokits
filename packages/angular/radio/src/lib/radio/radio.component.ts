import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  effect,
  ElementRef,
  forwardRef,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { fromAttr } from '@cocokits/common-angular-utils';
import { getRadioButtonClassNames, getRadioGroupClassNames, ThemeUIComponentPropValue } from '@cocokits/core';
import { UIComponentConfig } from '@cocokits/core/angular';

/**
 * To avoid get cycle dependencies, we have to create radio-group and radio-button in a single file.
 */

// Increasing integer for generating unique ids for checkbox components.
let nextUniqueId = 1;

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
export class RadioGroupComponent<T = unknown> implements ControlValueAccessor {
  private uiComponentConfig = inject(UIComponentConfig);

  /**
   * The type of radio-group.
   *
   * When set to `null`, no specific type is applied (Not event the default value).
   * This allows for more flexible styling options if the desired size is not available in the selected theme.
   */
  public type = input<string>();

  /**
   * The size of radio-group.
   *
   * When set to `null`, no specific size is applied (Not event the default value).
   * This allows for more flexible styling options if the desired size is not available in the selected theme.
   */
  public size = input<string>();

  /**
   * The color of radio-group.
   *
   * When set to `null`, no specific color is applied (Not event the default value).
   * This allows for more flexible styling options if the desired size is not available in the selected theme.
   */
  public color = input<string>();

  /**
   * A signal for attributes starting with `data-cck`.
   *
   * This allows each theme to define its own unique properties or configurations not shared globally across all themes.
   * For example, "rounded", "variant", and other custom properties.
   * Developers should use `data-cck-*` attributes on the component. This generates an object where each key is the attribute name and the value is what the developer specifies.
   * Based on this object, all necessary class names are created and appended to the host class, allowing the theme to easily select and style elements.
   *
   * @example
   * <cck-component [attr.data-cck-rounded]="roundedValue" [attr.data-cck-variant]="variantValue"/>
   *
   * additional = {
   *   rounded: roundedValue,
   *   variant: variantValue
   * }
   *
   * @internal
   */
  public additional = fromAttr<Record<string, ThemeUIComponentPropValue>>({ prefix: 'data-cck-' });

  /** Name of the radio button group. All radio buttons inside this group will use this name. */
  public name = input<string>(`cck-radio-group-${nextUniqueId++}`);

  /** The currently selected radio button */
  public selected = input<T>();

  /** Whether the radio group is disabled */
  public disabled = input<boolean>();

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

  private radios = contentChildren<RadioButtonComponent>(forwardRef(() => RadioButtonComponent));

  protected classNames = computed(() =>
    getRadioGroupClassNames(
      {
        type: this.type(),
        size: this.size(),
        color: this.color(),
        additional: this.additional(),
      },
      this.uiComponentConfig
    )
  );

  public _setSelectedRadio(radio: RadioButtonComponent<T>) {
    this.selectedRadio.set(radio);
  }

  /**
   * onTouch function registered via registerOnTouch (ControlValueAccessor).
   * @internal
   */
  onTouched: () => any = () => {
    // Do nothing
  };

  /** The method to be called in order to update ngModel */
  _controlValueAccessorChangeFn: (value: any) => void = () => {
    // Do nothing
  };

  /**
   * Sets the model value. Implemented as part of ControlValueAccessor.
   * @param value
   */
  writeValue(_value: any) {
    // Do nothing
  }

  /**
   * Registers a callback to be triggered when the model value changes.
   * Implemented as part of ControlValueAccessor.
   * @param fn Callback to be registered.
   */
  registerOnChange(fn: (value: any) => void) {
    this._controlValueAccessorChangeFn = fn;
  }

  /**
   * Registers a callback to be triggered when the control is touched.
   * Implemented as part of ControlValueAccessor.
   * @param fn Callback to be registered.
   */
  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  /**
   * Sets the disabled state of the control. Implemented as a part of ControlValueAccessor.
   * @param isDisabled Whether the control should be disabled.
   */
  setDisabledState(_isDisabled: boolean) {
    // Do nothing
  }
}

@Component({
  standalone: true,
  imports: [],
  selector: 'cck-radio-button',
  templateUrl: './radio-button.component.html',
  styleUrls: ['./radio-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'hostClassNames()',
  },
})
export class RadioButtonComponent<T = unknown> {
  private uiComponentConfig = inject(UIComponentConfig);

  /**
   * The type of radio-button.
   *
   * When set to `null`, no specific type is applied (Not event the default value).
   * This allows for more flexible styling options if the desired size is not available in the selected theme.
   */
  public type = input<string>();

  private effectedType = computed(() => this.type() ?? this.radioGroup?.type());

  /**
   * The size of radio-button.
   *
   * When set to `null`, no specific size is applied (Not event the default value).
   * This allows for more flexible styling options if the desired size is not available in the selected theme.
   */
  public size = input<string>();

  private effectedSize = computed(() => this.size() ?? this.radioGroup?.size());

  /**
   * The color of radio-button.
   *
   * When set to `null`, no specific color is applied (Not event the default value).
   * This allows for more flexible styling options if the desired size is not available in the selected theme.
   */
  public color = input<string>();

  private effectedColor = computed(() => this.color() ?? this.radioGroup?.color());

  /**
   * A signal for attributes starting with `data-cck`.
   *
   * This allows each theme to define its own unique properties or configurations not shared globally across all themes.
   * For example, "rounded", "variant", and other custom properties.
   * Developers should use `data-cck-*` attributes on the component. This generates an object where each key is the attribute name and the value is what the developer specifies.
   * Based on this object, all necessary class names are created and appended to the host class, allowing the theme to easily select and style elements.
   *
   * @example
   * <cck-component [attr.data-cck-rounded]="roundedValue" [attr.data-cck-variant]="variantValue"/>
   *
   * additional = {
   *   rounded: roundedValue,
   *   variant: variantValue
   * }
   *
   * @internal
   */
  public additional = fromAttr<Record<string, ThemeUIComponentPropValue>>({ prefix: 'data-cck-' });

  private effectedAdditional = computed(() => ({ ...this.additional(), ...this.radioGroup?.additional() }));

  private radioGroup = inject(RadioGroupComponent<T>, { optional: true });

  /** Analog to HTML 'name' attribute used to group radios for unique selection. */
  public name = input<string>();

  protected effectedName = computed(() => this.name() || this.radioGroup?.name());

  /** Whether this radio button is checked. */
  public checked = model<boolean>();

  protected effectedChecked = computed(() => this.checked() || this.radioGroup?.selected() === this.value());

  /** The value of this radio button. */
  public value = input.required<T>();

  /** Whether the radio button is disabled. */
  public disabled = input<boolean>();

  protected effectedDisabled = computed(() => this.disabled() || this.radioGroup?.disabled());

  /** The unique ID for the radio button. If none is supplied, it will be auto-generated. */
  public id = input(`cck-radio-${nextUniqueId++}`);

  /**
   * Event emitted when the group value changes.
   * Change events are only emitted when the value changes due to user interaction with
   * a radio button (the same behavior as `<input type-"radio">`).
   */
  readonly change = output<RadioChange<T>>();

  /** The native `<input type="radio">` element */
  private inputElement = viewChild<ElementRef<HTMLInputElement>>('input');

  protected classNames = computed(() =>
    getRadioButtonClassNames(
      {
        type: this.effectedType(),
        size: this.effectedSize(),
        color: this.effectedColor(),
        additional: this.effectedAdditional(),
      },
      this.uiComponentConfig
    )
  );

  protected hostClassNames = computed(() => {
    const classNames = [...this.classNames().host];

    if (this.checked()) {
      classNames.push(...this.classNames().checked);
    } else {
      classNames.push(...this.classNames().unchecked);
    }

    if (this.disabled()) {
      classNames.push(...this.classNames().disabled);
    }

    return classNames;
  });

  /** Focuses the radio button. */
  public focus(options?: FocusOptions): void {
    this.inputElement()?.nativeElement.focus(options);
  }

  /** Triggered when the radio button receives an interaction from the user. */
  protected _onInputChange(event: Event) {
    // We always have to stop propagation on the change event.
    // Otherwise the change event, from the input element, will bubble up and
    // emit its event object to the `change` output.
    event.stopPropagation();

    this.change.emit({ source: this, value: this.value() });
    this.radioGroup?._setSelectedRadio(this);
  }
}
