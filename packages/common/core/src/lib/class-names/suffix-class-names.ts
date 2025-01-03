import { generateLayoutClassNameFromElement } from './class-names';
import { LayoutClassNamesConfig, ThemeConfig, UIBaseComponentProps } from '../model/theme-config.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

export const suffixLayoutClassNamesConfig = {
  componentName: 'suffix',
  baseSelectorStructure: {
    block: 'suffix',
  },
  elements: {
    host: {
      name: 'Host Element',
      selectorStructure: [],
      description: 'It will add to the host element of Suffix component.',
    },
  },
} satisfies LayoutClassNamesConfig;

export function getSuffixClassNames(
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof suffixLayoutClassNamesConfig.elements, string> {
  validateUiBaseComponentProps(suffixLayoutClassNamesConfig.componentName, componentProps, themeConfig);

  return {
    host: generateLayoutClassNameFromElement(suffixLayoutClassNamesConfig, 'host', themeConfig, componentProps),
  };
}
