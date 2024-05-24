import { ChangeDetectionStrategy, Component, computed, input, InputSignal } from '@angular/core';

import { TrustHtmlPipe } from '@coco-kits/common-angular-utils';
import { BaseColor, IconSize, ThemeSvgIcon } from '@coco-kits/common-types';
import { getIconColorClass, getIconSizeClass } from '@coco-kits/theme-core';

@Component({
  selector: 'cck-svg-icon',
  standalone: true,
  templateUrl: './svg-icon.component.html',
  styleUrl: './svg-icon.component.scss',
  imports: [TrustHtmlPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'sizeClassName()',
  },
})
export class SvgIconComponent {
  /**
   * Input property that requires an SVG icon configuration.
   */
  public icon: InputSignal<ThemeSvgIcon> = input.required<ThemeSvgIcon>();

  /**
   * Input property for setting the size of the icon. Accepts values from the IconSize enum or null.
   *
   * When set to `null`, no specific size class is applied, and the icon will inherit styles from the parent element.
   * This allows for more flexible styling options if the desired size is not available in the selected theme.
   */
  public size: InputSignal<IconSize | null> = input<IconSize | null>(IconSize.Default);

  /**
   * Input property for setting the color of the icon. Accepts values from the BaseColor enum or `null`.
   *
   * When set to `null`, no specific color class is applied, and the icon will inherit color styles from the parent element.
   * This can be used to apply custom CSS styles directly to the host component if the desired color is not available.
   */
  public color: InputSignal<BaseColor | null> = input<BaseColor | null>(BaseColor.Default);

  protected sizeClassName = computed(() => getIconSizeClass(this.size()));
  protected colorClassName = computed(() => getIconColorClass(this.color()));
}
