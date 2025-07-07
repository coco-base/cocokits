import { generateLayoutClassNameFromElement } from './class-names';
import { LayoutClassNamesConfig, ThemeConfig, UIBaseComponentProps } from '../model/theme-config.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

export const tabsLayoutClassNamesConfigOld = {
  componentName: 'tabsOld',
  baseSelectorStructure: {
    block: 'tabs',
  },
  elements: {
    host: {
      name: 'Host Element',
      selectorStructure: [],
      description: 'This will be added to the host element of the Tabs component.',
    },
    labelsWrapper: {
      name: 'Labels Wrapper Element',
      selectorStructure: [{ element: 'labels-wrapper' }],
      description: 'This selector is applied to the wrapper element that contains all the tab labels.',
    },
    contentWrapper: {
      name: 'Content Wrapper Element',
      selectorStructure: [{ element: 'content-wrapper' }],
      description: 'This selector is applied to the wrapper element that contains the tab contents.',
    },
  },
} satisfies LayoutClassNamesConfig;

export function getTabsClassNamesOld(
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof tabsLayoutClassNamesConfigOld.elements, string> {
  validateUiBaseComponentProps(tabsLayoutClassNamesConfigOld.componentName, componentProps, themeConfig);

  return {
    host: generateLayoutClassNameFromElement(tabsLayoutClassNamesConfigOld, 'host', themeConfig, componentProps),
    labelsWrapper: generateLayoutClassNameFromElement(tabsLayoutClassNamesConfigOld, 'labelsWrapper', themeConfig),
    contentWrapper: generateLayoutClassNameFromElement(tabsLayoutClassNamesConfigOld, 'contentWrapper', themeConfig),
  };
}
