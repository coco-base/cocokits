import { isNotNullish, isNullish } from '@cocokits/common-utils';

export function cssSelectorRender({
  block,
  element,
  modifier,
}: {
  block: string;
  element?: string | number | boolean;
  modifier?: string | number | boolean | null;
}) {
  // ❌element & ❌modifier
  if (isNullish(element) && isNullish(modifier)) {
    return `${block}`;
  }

  // ✅element & ❌modifier
  if (isNotNullish(element) && isNullish(modifier)) {
    return `${block}__${element}`;
  }

  // ❌element & ✅modifier
  if (isNullish(element) && isNotNullish(modifier)) {
    return `${block}--${modifier}`;
  }

  // ✅element & ✅modifier
  return `${block}__${element}--${modifier}`;
}
