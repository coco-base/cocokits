import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  effect,
  inject,
  input,
  ViewEncapsulation,
} from '@angular/core';

import { SvgIconComponent } from '@cocokits/angular-icon';
import { fromAttr } from '@cocokits/common-angular-utils';
import { getIconButtonClassNames, ThemeUIComponentPropValue } from '@cocokits/theme-core';
import { UIComponentConfig } from '@cocokits/theme-core/angular';

@Component({
  standalone: true,
  imports: [],
  selector: 'button[cck-icon-button]',
  templateUrl: './icon-button.component.html',
  styleUrls: ['./icon-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'classNames().host',
  },
})
export class IconButtonComponent {
  private uiComponentConfig = inject(UIComponentConfig);

  /**
   * The type of icon-button.
   *
   * When set to `null`, no specific type is applied (Not event the default value).
   * This allows for more flexible styling options if the desired size is not available in the selected theme.
   */
  public type = input<string>();

  /**
   * The size of icon-button.
   *
   * When set to `null`, no specific size is applied (Not event the default value).
   * This allows for more flexible styling options if the desired size is not available in the selected theme.
   */
  public size = input<string>();

  /**
   * The color of icon-button.
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
    getIconButtonClassNames(
      {
        type: this.type(),
        size: this.size(),
        color: this.color(),
        additional: this.additional(),
      },
      this.uiComponentConfig
    )
  );

  private iconCompChildren = contentChildren(SvgIconComponent);

  // Reset icon props value to 'null', and take the styles of current component.
  private resetIconProp = effect(
    () => {
      this.iconCompChildren().forEach((iconChild) => {
        iconChild._setSkipProps(true);
      });
    },
    { allowSignalWrites: true }
  );
}
