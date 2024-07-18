import { ChangeDetectionStrategy, Component, computed, inject, input, ViewEncapsulation } from '@angular/core';

import { fromAttr } from '@cocokits/common-angular-utils';
import { getButtonClassNames, ThemeUIComponentPropValue } from '@cocokits/core';
import { UIComponentConfig } from '@cocokits/core/angular';

@Component({
  standalone: true,
  imports: [],
  selector: 'button[cck-button]',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'classNames().host',
  },
})
export class ButtonComponent {
  private uiComponentConfig = inject(UIComponentConfig);

  /**
   * The type of button.
   *
   * When set to `null`, no specific type is applied (Not event the default value).
   * This allows for more flexible styling options if the desired size is not available in the selected theme.
   */
  public type = input<string>();

  /**
   * The size of button.
   *
   * When set to `null`, no specific size is applied (Not event the default value).
   * This allows for more flexible styling options if the desired size is not available in the selected theme.
   */
  public size = input<string>();

  /**
   * The color of button.
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

  protected classNames = computed(() =>
    getButtonClassNames(
      {
        type: this.type(),
        size: this.size(),
        color: this.color(),
        additional: this.additional(),
      },
      this.uiComponentConfig
    )
  );
}
