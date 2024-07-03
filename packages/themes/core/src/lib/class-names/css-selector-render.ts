import { UIComponentsPropName } from '../model/ui-component.model';

export const cssSelectorRender: Record<UIComponentsPropName, (prefix: string, value: string) => string> = {
  type: (prefix, value) => `${prefix}__${value}`,
  size: (prefix, value) => `${prefix}__size--${value}`,
  color: (prefix, value) => `${prefix}__color--${value}`,
};

export const cssSelectorVariantElement: Record<UIComponentsPropName, string> = {
  type: 'Host Element',
  size: 'Svg Element',
  color: 'Svg Element',
};
