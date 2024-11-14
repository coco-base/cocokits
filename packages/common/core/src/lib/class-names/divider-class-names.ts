import { generateLayoutClassNameFromElement } from './class-names';
import { UIBaseComponentProps, ThemeConfig, LayoutClassNamesConfig } from '../model/theme-config.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

export const dividerLayoutClassNamesConfig = {
  componentName: 'divider',
  baseSelectorStructure: {
    block: 'divider',
  },
  elements: {
    host: {
      name: 'Host Element',
      selectorStructure: [],
      description: 'It will add to the host element of Divider component.',
    },
  },
} satisfies LayoutClassNamesConfig;

export function getDividerClassNames(
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof dividerLayoutClassNamesConfig.elements, string> {
  validateUiBaseComponentProps(dividerLayoutClassNamesConfig.componentName, componentProps, themeConfig);

  return {
    host: generateLayoutClassNameFromElement(dividerLayoutClassNamesConfig, 'host', themeConfig, componentProps),
  };
}
