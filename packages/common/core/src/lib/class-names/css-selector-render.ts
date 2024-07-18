import { isNullish } from '@cocokits/common-utils';

export function cssSelectorRender(
  block: string,
  element: string | number | boolean,
  modifier?: string | number | boolean | null
) {
  return isNullish(modifier) ? `${block}__${element}` : `${block}__${element}--${modifier}`;
}
