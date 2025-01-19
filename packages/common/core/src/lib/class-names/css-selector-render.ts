import { hasNotValue, hasValue } from '@cocokits/common-utils';

export function cssSelectorRender({
  themePrefix,
  block,
  element,
  modifier,
}: {
  themePrefix: string;
  block: string;
  element?: string | number | boolean | null;
  modifier?: string | number | boolean | null;
}) {
  const cckPrefix = 'cck';
  const prefix = [themePrefix, cckPrefix].filter(Boolean).join('-');

  // ❌element & ❌modifier
  if (hasNotValue(element) && hasNotValue(modifier)) {
    return `${prefix}-${block}`;
  }

  // ✅element & ❌modifier
  if (hasValue(element) && hasNotValue(modifier)) {
    return `${prefix}-${block}__${element}`;
  }

  // ❌element & ✅modifier
  if (hasNotValue(element) && hasValue(modifier)) {
    return `${prefix}-${block}--${modifier}`;
  }

  // ✅element & ✅modifier
  return `${prefix}-${block}__${element}--${modifier}`;
}
