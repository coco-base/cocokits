import { isNotNullish, recordForEach } from '@cocokits/common-utils';

import { cssSelectorRender } from './css-selector-render';
import { ThemeUIComponentsOptions } from '../model/ui-component.model';
import { getComponentPropsWithDefault } from '../ui-component-props/ui-component-props';

export function getHostClassNames(prefix: string, options: ThemeUIComponentsOptions) {
  const classNames = [];

  const { type, color, size, additional } = getComponentPropsWithDefault(options);

  if (isNotNullish(type)) {
    classNames.push(cssSelectorRender(prefix, type));
  }

  if (color) {
    classNames.push(cssSelectorRender(prefix, 'color', color));
  }

  if (size) {
    classNames.push(cssSelectorRender(prefix, 'size', size));
  }

  if (additional) {
    recordForEach(additional, (value, key) => {
      classNames.push(cssSelectorRender(prefix, key, value));
    });
  }

  return classNames;
}
