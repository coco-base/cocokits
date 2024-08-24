import { ChangeDetectionStrategy, Component, computed, input, InputSignal, ViewEncapsulation } from '@angular/core';

import { _UiBaseComponent } from '@cocokits/angular-core';
import { TrustHtmlPipe } from '@cocokits/angular-utils';
import { ThemeSvgIcon } from '@cocokits/core';

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
export class SvgIconComponent extends _UiBaseComponent<'svgIcon'> {
  protected readonly componentName = 'svgIcon';
  protected extraHostElementClassConditions = computed(() => []);

  /**
   * Input property that requires an SVG icon configuration.
   */
  public icon: InputSignal<ThemeSvgIcon> = input.required<ThemeSvgIcon>();
}
