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
    // example: {
    //   name: '...',
    //   selectorStructure: [{ element: '...', modifier: '...' }],
    //   description: `...`,
    // },
  },
} satisfies LayoutClassNamesConfig;

export function getTabClassNames(
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof tabLayoutClassNamesConfig.elements, string> {
  validateUiBaseComponentProps(tabLayoutClassNamesConfig.componentName, componentProps, themeConfig);

  return {
    host: generateLayoutClassNameFromElement(tabLayoutClassNamesConfig, 'host', themeConfig, componentProps),
    // example: generateLayoutClassNameFromElement(tabLayoutClassNamesConfig, 'example', themeConfig),
  };
}
