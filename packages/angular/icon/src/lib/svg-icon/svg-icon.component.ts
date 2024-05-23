import { ChangeDetectionStrategy, Component, computed, input, InputSignal } from '@angular/core';

import { TrustHtmlPipe } from '@coco-kits/common-angular-utils';
import { BaseColor, IconSize, ThemeSvgIcon } from '@coco-kits/common-types';

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

  private sizeClassName = computed(() => getIconSizeClass(this.size()));
  private colorClassName = computed(() => getIconColorClass(this.color()));
  protected classNames = computed(() => [this.sizeClassName(), this.colorClassName()]);
}

// TODO: Move this function to theme-core library
function getIconSizeClass(size: IconSize | null): string | null {
  switch (size) {
    case IconSize.Default:
      return 'cck-icon__size--default';
    case IconSize.XS:
      return 'cck-icon__size--xs';
    case IconSize.Sm:
      return 'cck-icon__size--sm';
    case IconSize.Md:
      return 'cck-icon__size--md';
    case IconSize.Lg:
      return 'cck-icon__size--lg';
    case IconSize.XL:
      return 'cck-icon__size--xl';
    case IconSize.XXL:
      return 'cck-icon__size--2xl';
    default:
      return null;
  }
}

// TODO: Move this function to theme-core library
function getIconColorClass(color: BaseColor | null): string | null {
  switch (color) {
    case BaseColor.Default:
      return 'cck-icon__color--default';
    case BaseColor.Brand:
      return 'cck-icon__color--brand';
    case BaseColor.Info:
      return 'cck-icon__color--info';
    case BaseColor.Warning:
      return 'cck-icon__color--warning';
    case BaseColor.Error:
      return 'cck-icon__color--error';
    case BaseColor.HighContrast:
      return 'cck-icon__color--h-contrast';
    case BaseColor.MediumContrast:
      return 'cck-icon__size--m-contrast';
    case BaseColor.LowContrast:
      return 'cck-icon__size--l-contrast';
    default:
      return null;
  }
}
