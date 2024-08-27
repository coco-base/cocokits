import { computed, Directive, inject, input, InputSignal, Signal } from '@angular/core';

import { fromAttrWithPrefix } from '@cocokits/angular-utils';
import { getClassNames, ThemeUIComponentPropValue, UIComponentsName } from '@cocokits/core';

import { UIComponentConfig } from './tokens';

@Directive()
export abstract class _UiBaseComponent<ComponentsName extends UIComponentsName> {
  protected abstract readonly componentName: ComponentsName;
  // When the `if` condition is true, then the class list will be added to the host element
  protected abstract extraHostElementClassConditions: Signal<
    { if: boolean | undefined | null | any; classes: string[] }[]
  >;

  protected uiComponentConfig = inject(UIComponentConfig);

  /**
   * The type of component.
   *
   * When set to `null`, no specific type is applied (Not event the default value).
   * This allows for more flexible styling options if the desired size is not available in the selected theme.
   */
  public type: InputSignal<string | undefined | null> = input<string | null>();

  /**
   * The size of form-field.
   *
   * When set to `null`, no specific size is applied (Not event the default value).
   * This allows for more flexible styling options if the desired size is not available in the selected theme.
   */
  public size: InputSignal<string | undefined | null> = input<string | null>();

  /**
   * The color of form-field.
   *
   * When set to `null`, no specific color is applied (Not event the default value).
   * This allows for more flexible styling options if the desired size is not available in the selected theme.
   */
  public color: InputSignal<string | undefined | null> = input<string | null>();

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
  public additional = fromAttrWithPrefix<Record<string, ThemeUIComponentPropValue>>('data-cck-');

  // All effected properties can be overridden by the parent class to set the final value.
  // For example: the size of `RadioComponent` depends on 2 values,
  // first try to get the size from `RadioComponent` and if is not present the take it from `RadioGroupComponent`
  public _effectedType = computed(() => this.type());
  public _effectedSize = computed(() => this.size());
  public _effectedColor = computed(() => this.color());
  public _effectedAdditional = computed(() => this.additional());

  protected classNames = computed(() =>
    getClassNames<ComponentsName>(
      this.componentName,
      {
        type: this.baseClassOptions.skipType ? null : this._effectedType(),
        size: this.baseClassOptions.skipSize ? null : this._effectedSize(),
        color: this.baseClassOptions.skipColor ? null : this._effectedColor(),
        additional: this.baseClassOptions.skipAdditional ? undefined : this._effectedAdditional(),
      },
      this.uiComponentConfig
    )
  );

  protected hostClassNames = computed(() => [
    ...this.classNames().host,
    ...this.extraHostElementClassConditions().flatMap((condition) => (condition.if ? condition.classes : [])),
  ]);

  protected baseClassOptions = {
    skipType: false,
    skipColor: false,
    skipSize: false,
    skipAdditional: false,
  };
}
