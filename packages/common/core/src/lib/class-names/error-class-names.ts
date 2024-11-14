import { generateLayoutClassNameFromElement } from './class-names';
import { UIBaseComponentProps, ThemeConfig, LayoutClassNamesConfig } from '../model/theme-config.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

export const errorLayoutClassNamesConfig = {
  componentName: 'error',
  baseSelectorStructure: {
    block: 'error',
  },
  elements: {
    host: {
      name: 'Host Element',
      selectorStructure: [],
      description: 'It will add to the host element of Error component.',
    },
  },
} satisfies LayoutClassNamesConfig;

export function getErrorClassNames(
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof errorLayoutClassNamesConfig.elements, string> {
  validateUiBaseComponentProps(errorLayoutClassNamesConfig.componentName, componentProps, themeConfig);

  return {
    host: generateLayoutClassNameFromElement(errorLayoutClassNamesConfig, 'host', themeConfig, componentProps),
  };
}
