import { generateLayoutClassNameFromElement } from './class-names';
import { LayoutClassNamesConfig, ThemeConfig, UIBaseComponentProps } from '../model/theme-config.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

export const tabsLayoutClassNamesConfig = {
  componentName: 'tabs',
  baseSelectorStructure: { block: 'tabs' },
  elements: {
    host: {
      name: 'Host Element',
      selectorStructure: [],
      description: 'It will add to the host element of `Tabs` component.',
    },
    headersWrapper: {
      name: 'Headers Wrapper Element',
      selectorStructure: [{ element: 'headers-wrapper' }],
      description: 'This selector is applied to the wrapper element that contains all the tab headers.',
    },
    contentWrapper: {
      name: 'Content Wrapper Element',
      selectorStructure: [{ element: 'content-wrapper' }],
      description: 'This selector is applied to the wrapper element that contains the tab contents.',
    },
    alignLeft: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'align-left' }],
      description: 'This selector is applied to the host element, when the header align is left.',
    },
    alignCenter: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'align-center' }],
      description: 'This selector is applied to the host element, when the header align is center.',
    },
    alignRight: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'align-right' }],
      description: 'This selector is applied to the host element, when the header align is right.',
    },
    alignStretch: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'align-stretch' }],
      description: 'This selector is applied to the host element, when the header align is stretch.',
    },
  },
} satisfies LayoutClassNamesConfig;

export function getTabsClassNames(
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof tabsLayoutClassNamesConfig.elements, string> {
  validateUiBaseComponentProps(tabsLayoutClassNamesConfig.componentName, componentProps, themeConfig);

  return {
    host: generateLayoutClassNameFromElement(tabsLayoutClassNamesConfig, 'host', themeConfig, componentProps),
    headersWrapper: generateLayoutClassNameFromElement(tabsLayoutClassNamesConfig, 'headersWrapper', themeConfig),
    contentWrapper: generateLayoutClassNameFromElement(tabsLayoutClassNamesConfig, 'contentWrapper', themeConfig),
    alignLeft: generateLayoutClassNameFromElement(tabsLayoutClassNamesConfig, 'alignLeft', themeConfig),
    alignCenter: generateLayoutClassNameFromElement(tabsLayoutClassNamesConfig, 'alignCenter', themeConfig),
    alignRight: generateLayoutClassNameFromElement(tabsLayoutClassNamesConfig, 'alignRight', themeConfig),
    alignStretch: generateLayoutClassNameFromElement(tabsLayoutClassNamesConfig, 'alignStretch', themeConfig),
  };
}
