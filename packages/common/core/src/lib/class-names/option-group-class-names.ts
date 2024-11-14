import { generateLayoutClassNameFromElement } from './class-names';
import { UIBaseComponentProps, ThemeConfig, LayoutClassNamesConfig } from '../model/theme-config.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

export const optionGroupLayoutClassNamesConfig = {
  componentName: 'optionGroup',
  baseSelectorStructure: {
    block: 'option-group',
  },
  elements: {
    host: {
      name: 'Host Element',
      selectorStructure: [],
      description: 'It will add to the host element of OptionGroup component.',
    },
    disabled: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'disabled' }],
      description: 'It will add to the host element of OptionGroup component, the component is disabled',
    },
    label: {
      name: 'Label Element',
      selectorStructure: [{ modifier: 'label' }],
      description: 'It will add to the label element of OptionGroup component',
    },
  },
} satisfies LayoutClassNamesConfig;

export function getOptionGroupClassNames(
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof optionGroupLayoutClassNamesConfig.elements, string> {
  validateUiBaseComponentProps(optionGroupLayoutClassNamesConfig.componentName, componentProps, themeConfig);

  return {
    host: generateLayoutClassNameFromElement(optionGroupLayoutClassNamesConfig, 'host', themeConfig, componentProps),
    disabled: generateLayoutClassNameFromElement(optionGroupLayoutClassNamesConfig, 'disabled', themeConfig),
    label: generateLayoutClassNameFromElement(optionGroupLayoutClassNamesConfig, 'label', themeConfig),
  };
}
