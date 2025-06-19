import { generateLayoutClassNameFromElement } from './class-names';
import { LayoutClassNamesConfig, ThemeConfig, UIBaseComponentProps } from '../model/theme-config.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

export const tabLabelLayoutClassNamesConfigOld = {
  componentName: 'tabLabelOld',
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

export function getTabLabelClassNamesOld(
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof tabLabelLayoutClassNamesConfigOld.elements, string> {
  validateUiBaseComponentProps(tabLabelLayoutClassNamesConfigOld.componentName, componentProps, themeConfig);

  return {
    host: generateLayoutClassNameFromElement(tabLabelLayoutClassNamesConfigOld, 'host', themeConfig, componentProps),
  };
}
