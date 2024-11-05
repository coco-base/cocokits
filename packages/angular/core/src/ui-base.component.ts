import { computed, Directive, inject, input, InputSignal, Signal } from '@angular/core';

import { fromAttrWithPrefix } from '@cocokits/angular-utils';
import { getClassNames, UIBaseComponentsPropValue, UIComponentsName } from '@cocokits/core';

import { UIComponentConfig } from './tokens';

@Directive()
export abstract class _UiBaseComponent<ComponentsName extends UIComponentsName> {
  protected abstract readonly componentName: ComponentsName;
  // When the `if` condition is true, then the class list will be added to the host element
  protected abstract extraHostElementClassConditions: Signal<
    { if: boolean | undefined | null | any; classes: string }[]
  >;

  protected uiComponentConfig = inject(UIComponentConfig);

  /**
   * The type of component.
   *
   * When set to `null`, no specific type is applied (Not event the default value).
   * This allows for more flexible styling options if the desired size is not available in the selected theme.
   */
  public _type: InputSignal<string | undefined | null> = input<string | null | undefined>(undefined, { alias: 'type' });

  /**
   * The size of component.
   *
   * When set to `null`, no specific size is applied (Not event the default value).
   * This allows for more flexible styling options if the desired size is not available in the selected theme.
   */
  public _size: InputSignal<string | undefined | null> = input<string | null | undefined>(undefined, { alias: 'size' });

  /**
   * The color of component.
   *
   * When set to `null`, no specific color is applied (Not event the default value).
   * This allows for more flexible styling options if the desired size is not available in the selected theme.
   */
  public _color: InputSignal<string | undefined | null> = input<string | null | undefined>(undefined, {
    alias: 'color',
  });

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
  public _additional = fromAttrWithPrefix<Record<string, UIBaseComponentsPropValue>>('data-cck-');

  // All following properties can be overridden by the parent class to set the final value.
  // For example: the size of `RadioComponent` depends on 2 values,
  // first try to get the size from `RadioComponent` and if is not present the take it from `RadioGroupComponent`
  /** @internal */
  public type = computed(() => this._type());
  /** @internal */
  public size = computed(() => this._size());
  /** @internal */
  public color = computed(() => this._color());
  /** @internal */
  public additional = computed(() => this._additional());

  protected classNames = computed(() => {
    return getClassNames<ComponentsName>(
      this.componentName,
      {
        type: this.baseClassOptions.skipType ? null : this.type(),
        size: this.baseClassOptions.skipSize ? null : this.size(),
        color: this.baseClassOptions.skipColor ? null : this.color(),
        additional: this.baseClassOptions.skipAdditional ? undefined : this.additional(),
      },
      this.uiComponentConfig
    );
  });

  protected hostClassNames = computed(() =>
    [
      this.classNames().host,
      ...this.extraHostElementClassConditions()
        .filter((condition) => condition.if)
        .map((condition) => condition.classes),
    ].join(' ')
  );

  protected baseClassOptions = {
    skipType: false,
    skipColor: false,
    skipSize: false,
    skipAdditional: false,
  };
}
