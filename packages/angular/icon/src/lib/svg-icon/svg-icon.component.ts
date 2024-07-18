import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  InputSignal,
  signal,
  ViewEncapsulation,
} from '@angular/core';

import { fromAttr, TrustHtmlPipe } from '@cocokits/common-angular-utils';
import { getSvgIconClassNames, ThemeSvgIcon, ThemeUIComponentPropValue } from '@cocokits/core';
import { UIComponentConfig } from '@cocokits/core/angular';

@Component({
  selector: 'cck-svg-icon',
  standalone: true,
  templateUrl: './svg-icon.component.html',
  styleUrl: './svg-icon.component.scss',
  imports: [TrustHtmlPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'classNames().host',
  },
})
export class SvgIconComponent {
  private uiComponentConfig = inject(UIComponentConfig);

  /**
   * Input property that requires an SVG icon configuration.
   */
  public icon: InputSignal<ThemeSvgIcon> = input.required<ThemeSvgIcon>();

  /**
   * The size of svg icon.
   *
   * When set to `null`, no specific size is applied (Not event the default value).
   * This allows for more flexible styling options if the desired size is not available in the selected theme.
   */
  public size: InputSignal<string | undefined> = input<string>();

  /**
   * The color of svg icon
   *
   * When set to `null`, no specific color is applied (Not event the default value).
   * This allows for more flexible styling options if the desired size is not available in the selected theme.
   */
  public color: InputSignal<string | undefined> = input<string>();

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
    getSvgIconClassNames(
      {
        size: this.skipProps() ? null : this.size(),
        color: this.skipProps() ? null : this.color(),
      },
      this.uiComponentConfig
    )
  );

  private skipProps = signal(false);

  /**
   * Set the 'color' and 'size' value to 'null', to can be overide by prent component such as 'iconButton'
   * @internal
   */
  public _setSkipProps(skip: boolean) {
    this.skipProps.set(skip);
  }
}
