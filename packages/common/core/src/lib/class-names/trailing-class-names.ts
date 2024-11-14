import { generateLayoutClassNameFromElement } from './class-names';
import { UIBaseComponentProps, ThemeConfig, LayoutClassNamesConfig } from '../model/theme-config.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

export const trailingLayoutClassNamesConfig = {
  componentName: 'trailing',
  baseSelectorStructure: {
    block: 'trailing',
  },
  elements: {
    host: {
      name: 'Host Element',
      selectorStructure: [],
      description: 'It will add to the host element of Trailing component.',
    },
    clickable: {
      name: 'Clickable Host Element',
      selectorStructure: [{ modifier: 'clickable' }],
      description: 'It will add to the host element of Trailing component, when the element is clickable',
    },
  },
} satisfies LayoutClassNamesConfig;

export function getTrailingClassNames(
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof trailingLayoutClassNamesConfig.elements, string> {
  validateUiBaseComponentProps(trailingLayoutClassNamesConfig.componentName, componentProps, themeConfig);

  return {
    host: generateLayoutClassNameFromElement(trailingLayoutClassNamesConfig, 'host', themeConfig, componentProps),
    clickable: generateLayoutClassNameFromElement(trailingLayoutClassNamesConfig, 'clickable', themeConfig),
  };
}
