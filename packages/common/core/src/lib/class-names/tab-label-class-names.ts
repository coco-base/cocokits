import { generateLayoutClassNameFromElement } from './class-names';
import { UIBaseComponentProps, ThemeConfig, LayoutClassNamesConfig } from '../model/theme-config.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

export const tabLabelLayoutClassNamesConfig = {
  componentName: 'tabLabel',
  baseSelectorStructure: {
    block: 'tab-label',
  },
  elements: {
    host: {
      name: 'Host Element',
      selectorStructure: [],
      description: 'It will add to the host element of tabLabel component.',
    },
  },
} satisfies LayoutClassNamesConfig;

export function getTabLabelClassNames(
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof tabLabelLayoutClassNamesConfig.elements, string> {
  validateUiBaseComponentProps(tabLabelLayoutClassNamesConfig.componentName, componentProps, themeConfig);

  return {
    host: generateLayoutClassNameFromElement(tabLabelLayoutClassNamesConfig, 'host', themeConfig, componentProps),
  };
}
