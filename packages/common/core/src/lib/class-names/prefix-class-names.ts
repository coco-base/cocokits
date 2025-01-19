import { generateLayoutClassNameFromElement } from './class-names';
import { LayoutClassNamesConfig, ThemeConfig, UIBaseComponentProps } from '../model/theme-config.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

export const prefixLayoutClassNamesConfig = {
  componentName: 'prefix',
  baseSelectorStructure: {
    block: 'prefix',
  },
  elements: {
    host: {
      name: 'Host Element',
      selectorStructure: [],
      description: 'It will add to the host element of Prefix component.',
    },
  },
} satisfies LayoutClassNamesConfig;

export function getPrefixClassNames(
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof prefixLayoutClassNamesConfig.elements, string> {
  validateUiBaseComponentProps(prefixLayoutClassNamesConfig.componentName, componentProps, themeConfig);

  return {
    host: generateLayoutClassNameFromElement(prefixLayoutClassNamesConfig, 'host', themeConfig, componentProps),
  };
}
