import { generateLayoutClassNameFromElement } from './class-names';
import { LayoutClassNamesConfig, ThemeConfig, UIBaseComponentProps } from '../model/theme-config.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

export const tabLayoutClassNamesConfigOld = {
  componentName: 'tabOld',
  baseSelectorStructure: {
    block: 'tab',
  },
  elements: {
    host: {
      name: 'Host Element',
      selectorStructure: [],
      description: 'Applied to the host element of the Tab component.',
    },
    indicator: {
      name: 'Indicator Element',
      selectorStructure: [{ element: 'indicator' }],
      description: 'Applied to the indicator element inside the Tab component, visible only for the selected tab.',
    },
    content: {
      name: 'Content Element',
      selectorStructure: [{ element: 'content' }],
      description: 'Applied to the element that contains the content of the Tab component.',
    },
    selected: {
      name: 'Selected Tab',
      selectorStructure: [{ modifier: 'selected' }],
      description: 'Applied to the host element of the Tab button component, when the the tab is selected.',
    },
    unselected: {
      name: 'Unselected Tab',
      selectorStructure: [{ modifier: 'unselected' }],
      description: 'Applied to the host element of the Tab button component, when the the tab is NOT selected.',
    },
  },
} satisfies LayoutClassNamesConfig;

export function getTabClassNamesOld(
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof tabLayoutClassNamesConfigOld.elements, string> {
  validateUiBaseComponentProps(tabLayoutClassNamesConfigOld.componentName, componentProps, themeConfig);

  return {
    host: generateLayoutClassNameFromElement(tabLayoutClassNamesConfigOld, 'host', themeConfig, componentProps),
    indicator: generateLayoutClassNameFromElement(tabLayoutClassNamesConfigOld, 'indicator', themeConfig),
    content: generateLayoutClassNameFromElement(tabLayoutClassNamesConfigOld, 'content', themeConfig),
    selected: generateLayoutClassNameFromElement(tabLayoutClassNamesConfigOld, 'selected', themeConfig),
    unselected: generateLayoutClassNameFromElement(tabLayoutClassNamesConfigOld, 'unselected', themeConfig),
  };
}
