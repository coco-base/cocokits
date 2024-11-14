import { generateLayoutClassNameFromElement } from './class-names';
import { UIBaseComponentProps, ThemeConfig, LayoutClassNamesConfig } from '../model/theme-config.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

export const radioGroupLayoutClassNamesConfig = {
  componentName: 'radioGroup',
  baseSelectorStructure: {
    block: 'radio-group',
  },
  elements: {
    host: {
      name: 'Host Element',
      selectorStructure: [],
      description: 'It will add to the host element of Radio Group component.',
    },
    disabled: {
      name: 'Host Element - disabled status',
      selectorStructure: [{ modifier: 'disabled' }],
      description: 'Applied to the host element of the Radio Group component, when the all radio group is disabled',
    },
  },
} satisfies LayoutClassNamesConfig;

export function getRadioGroupClassNames(
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof radioGroupLayoutClassNamesConfig.elements, string> {
  validateUiBaseComponentProps(radioGroupLayoutClassNamesConfig.componentName, componentProps, themeConfig);

  return {
    host: generateLayoutClassNameFromElement(radioGroupLayoutClassNamesConfig, 'host', themeConfig, componentProps),
    disabled: generateLayoutClassNameFromElement(radioGroupLayoutClassNamesConfig, 'disabled', themeConfig),
  };
}
