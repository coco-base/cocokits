import { ChangeDetectionStrategy, Component, computed, inject, input, InputSignal } from '@angular/core';

import { TrustHtmlPipe } from '@cocokits/common-angular-utils';
import { ThemeSvgIcon } from '@cocokits/common-types';
import { getSvgIconClassNames } from '@cocokits/theme-core';
import { UIComponentConfig } from '@cocokits/theme-core/angular';

@Component({
  selector: 'cck-svg-icon',
  standalone: true,
  templateUrl: './svg-icon.component.html',
  styleUrl: './svg-icon.component.scss',
  imports: [TrustHtmlPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  protected classNames = computed(() =>
    getSvgIconClassNames(
      {
        size: this.size(),
        color: this.color(),
      },
      this.uiComponentConfig
    )
  );
}
