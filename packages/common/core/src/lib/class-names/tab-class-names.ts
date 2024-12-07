import { generateLayoutClassNameFromElement } from './class-names';
import { UIBaseComponentProps, ThemeConfig, LayoutClassNamesConfig } from '../model/theme-config.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

export const tabLayoutClassNamesConfig = {
  componentName: 'tab',
  baseSelectorStructure: {
    block: 'tab',
  },
  elements: {
    host: {
      name: 'Host Element',
      selectorStructure: [],
      description: 'It will add to the host element of Tab component.',
    },
  },
} satisfies LayoutClassNamesConfig;

export function getTabClassNames(
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof tabLayoutClassNamesConfig.elements, string> {
  validateUiBaseComponentProps(tabLayoutClassNamesConfig.componentName, componentProps, themeConfig);

  return {
    host: generateLayoutClassNameFromElement(tabLayoutClassNamesConfig, 'host', themeConfig, componentProps),
    // disabled: generateLayoutClassNameFromElement(tabLayoutClassNamesConfig, 'disabled', themeConfig),
    // input: generateLayoutClassNameFromElement(tabLayoutClassNamesConfig, 'input', themeConfig),
  };
}
