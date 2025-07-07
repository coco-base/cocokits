import { generateLayoutClassNameFromElement } from './class-names';
import { LayoutClassNamesConfig, ThemeConfig, UIBaseComponentProps } from '../model/theme-config.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

export const tabLayoutClassNamesConfig = {
  componentName: 'tab',
  baseSelectorStructure: { block: 'tab' },
  elements: {
    host: {
      name: 'Host Element',
      selectorStructure: [],
      description: 'It will add to the host element of `Tab` component.',
    },
    headerWrapper: {
      name: 'Header Wrapper Element',
      selectorStructure: [{ element: 'label' }],
      description: 'Applied to the header wrapper element Tab component.',
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
      name: 'Host Element',
      selectorStructure: [{ modifier: 'selected' }],
      description: 'Applied to the host element of the Tab button component, when the the tab is selected.',
    },
    unselected: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'unselected' }],
      description: 'Applied to the host element of the Tab button component, when the the tab is NOT selected.',
    },
    disabled: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'disabled' }],
      description: 'Applied to the host element of the Tab button component, when the the tab is disabled.',
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
    headerWrapper: generateLayoutClassNameFromElement(tabLayoutClassNamesConfig, 'headerWrapper', themeConfig),
    indicator: generateLayoutClassNameFromElement(tabLayoutClassNamesConfig, 'indicator', themeConfig),
    content: generateLayoutClassNameFromElement(tabLayoutClassNamesConfig, 'content', themeConfig),
    selected: generateLayoutClassNameFromElement(tabLayoutClassNamesConfig, 'selected', themeConfig),
    unselected: generateLayoutClassNameFromElement(tabLayoutClassNamesConfig, 'unselected', themeConfig),
    disabled: generateLayoutClassNameFromElement(tabLayoutClassNamesConfig, 'disabled', themeConfig),
  };
}
