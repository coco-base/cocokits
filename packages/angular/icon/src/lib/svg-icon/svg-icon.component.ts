import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { TrustHtmlPipe } from '@coco-kits/common-angular-utils';
import type { SvgIcon } from '@coco-kits/theme-core';

@Component({
  selector: 'cck-svg-icon',
  standalone: true,
  templateUrl: './svg-icon.component.html',
  styleUrl: './svg-icon.component.scss',
  imports: [TrustHtmlPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SvgIconComponent {
  /**
   * Input property that requires an SVG icon configuration.
   * @requires
   */
  public icon = input.required<SvgIcon>();
}
