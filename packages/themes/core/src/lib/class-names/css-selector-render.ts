import { isNullish } from '@cocokits/common-utils';

import { UIComponentsPropName } from '../model/ui-component.model';

export function cssSelectorRender(
  block: string,
  element: string | number | boolean,
  modifier?: string | number | boolean | null
) {
  return isNullish(modifier) ? `${block}__${element}` : `${block}__${element}--${modifier}`;
}

export const cssSelectorVariantElement: Record<UIComponentsPropName, string> = {
  type: 'Host Element',
  size: 'Svg Element',
  color: 'Svg Element',
};
