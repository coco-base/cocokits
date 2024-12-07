import { generateLayoutClassNameFromElement } from './class-names';
import { UIBaseComponentProps, ThemeConfig, LayoutClassNamesConfig } from '../model/theme-config.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

export const tabsLayoutClassNamesConfig = {
  componentName: 'tabs',
  baseSelectorStructure: {
    block: 'tabs',
  },
  elements: {
    host: {
      name: 'Host Element',
      selectorStructure: [],
      description: 'It will add to the host element of Tabs component.',
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
    // disabled: generateLayoutClassNameFromElement(tabsLayoutClassNamesConfig, 'disabled', themeConfig),
    // input: generateLayoutClassNameFromElement(tabsLayoutClassNamesConfig, 'input', themeConfig),
  };
}

/**
 * <Tabs color size type ...>
 *  <Tab label="Tab1">Content 1</Tab>
 *  <Tab label="(selected) => <TabLabel>...</TabLabel>">Content 1</Tab>
 * </Tabs>
 */
