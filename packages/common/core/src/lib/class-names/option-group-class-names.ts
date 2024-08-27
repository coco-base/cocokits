import { getHostClassNames } from './class-names';
import { ThemeUIComponentProps, ThemeUIComponentsConfig, ThemeUIComponentsOptions } from '../model/ui-component.model';
import { validateUiComponentProps } from '../ui-component-props/ui-component-props';

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
  componentProps: ThemeUIComponentProps,
  uiComponentsConfig: ThemeUIComponentsConfig
): Record<keyof typeof optionGroupLayoutClassNamesConfig.elements, string[]> {
  const options: ThemeUIComponentsOptions = {
    componentName: 'optionGroup',
    componentProps,
    uiComponentsConfig,
  };
  validateUiComponentProps(options);
  return {
    host: [
      ...optionGroupLayoutClassNamesConfig.elements.host.selectors,
      ...getHostClassNames(optionGroupLayoutClassNamesConfig.prefix, options),
    ],
    disabled: [...optionGroupLayoutClassNamesConfig.elements.disabled.selectors],
    label: [...optionGroupLayoutClassNamesConfig.elements.label.selectors],
  };
}
