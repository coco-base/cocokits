import { BaseColor, IconSize } from '@coco-kits/common-types';

export function getIconSizeClass(size: IconSize | null): string | null {
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

export function getIconColorClass(color: BaseColor | null): string | null {
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
