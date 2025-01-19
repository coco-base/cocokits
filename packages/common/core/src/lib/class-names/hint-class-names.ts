import { generateLayoutClassNameFromElement } from './class-names';
import { LayoutClassNamesConfig, ThemeConfig, UIBaseComponentProps } from '../model/theme-config.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

export const hintLayoutClassNamesConfig = {
  componentName: 'hint',
  baseSelectorStructure: {
    block: 'hint',
  },
  elements: {
    host: {
      name: 'Host Element',
      selectorStructure: [],
      description: 'It will add to the host element of Hint component.',
    },
  },
} satisfies LayoutClassNamesConfig;

export function getHintClassNames(
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof hintLayoutClassNamesConfig.elements, string> {
  validateUiBaseComponentProps(hintLayoutClassNamesConfig.componentName, componentProps, themeConfig);

  return {
    host: generateLayoutClassNameFromElement(hintLayoutClassNamesConfig, 'host', themeConfig, componentProps),
  };
}
