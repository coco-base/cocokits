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
    // example: {
    //   name: '...',
    //   selectorStructure: [{ element: '...', modifier: '...' }],
    //   description: `...`,
    // },
  },
} satisfies LayoutClassNamesConfig;

export function getTabsClassNames(
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof tabsLayoutClassNamesConfig.elements, string> {
  validateUiBaseComponentProps(tabsLayoutClassNamesConfig.componentName, componentProps, themeConfig);

  return {
    host: generateLayoutClassNameFromElement(tabsLayoutClassNamesConfig, 'host', themeConfig, componentProps),
    // example: generateLayoutClassNameFromElement(tabsLayoutClassNamesConfig, 'example', themeConfig),
  };
}
