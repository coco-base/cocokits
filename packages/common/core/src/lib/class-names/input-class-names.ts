import { generateLayoutClassNameFromElement } from './class-names';
import { LayoutClassNamesConfig, ThemeConfig, UIBaseComponentProps } from '../model/theme-config.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

export const inputLayoutClassNamesConfig = {
  componentName: 'input',
  baseSelectorStructure: {
    block: 'input',
  },
  elements: {
    host: {
      name: 'Host Element',
      selectorStructure: [],
      description: 'It will add to the host element of Input component.',
    },
    disabled: {
      name: 'Disabled Modifier',
      selectorStructure: [{ modifier: 'disabled' }],
      description: 'It will add to the host element of Input component when the component is disabled',
    },
  },
} satisfies LayoutClassNamesConfig;

export function getInputClassNames(
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof inputLayoutClassNamesConfig.elements, string> {
  validateUiBaseComponentProps(inputLayoutClassNamesConfig.componentName, componentProps, themeConfig);
  return {
    host: generateLayoutClassNameFromElement(inputLayoutClassNamesConfig, 'host', themeConfig, componentProps),
    disabled: generateLayoutClassNameFromElement(inputLayoutClassNamesConfig, 'disabled', themeConfig),
  };
}
