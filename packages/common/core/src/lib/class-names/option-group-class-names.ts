import { getHostClassNames } from './class-names';
import { UIBaseComponentProps, ThemeConfig, CssSelectorGeneratorOptions } from '../model/ui-component.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

export const optionGroupLayoutClassNamesConfig = {
  prefix: 'cck-option-group',
  elements: {
    host: {
      name: 'Host Element',
      selectors: ['cck-option-group'],
      description: 'It will add to the host element of OptionGroup component.',
    },
    disabled: {
      name: 'Host Element',
      selectors: ['cck-option-group--disabled'],
      description: 'It will add to the host element of OptionGroup component, the component is disabled',
    },
    label: {
      name: 'Host Element',
      selectors: ['cck-option-group--label'],
      description: 'It will add to the label element of OptionGroup component',
    },
  },
};

export function getOptionGroupClassNames(
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof optionGroupLayoutClassNamesConfig.elements, string> {
  const options: CssSelectorGeneratorOptions = {
    componentName: 'optionGroup',
    componentProps,
    themeConfig,
  };
  validateUiBaseComponentProps(options);
  return {
    host: [
      ...optionGroupLayoutClassNamesConfig.elements.host.selectors,
      ...getHostClassNames(optionGroupLayoutClassNamesConfig.prefix, options),
    ].join(' '),
    disabled: [...optionGroupLayoutClassNamesConfig.elements.disabled.selectors].join(' '),
    label: [...optionGroupLayoutClassNamesConfig.elements.label.selectors].join(' '),
  };
}
