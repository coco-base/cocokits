import { getHostClassNames } from './class-names';
import { ThemeUIComponentProps, ThemeUIComponentsConfig, ThemeUIComponentsOptions } from '../model/ui-component.model';
import { validateUiComponentProps } from '../ui-component-props/ui-component-props';

export const radioGroupLayoutClassNamesConfig = {
  prefix: 'cck-radio-group',
  elements: {
    host: {
      name: 'Host Element',
      selectors: ['cck-radio-group'],
      description: 'It will add to the host element of Radio Group component.',
    },
    disabled: {
      name: 'Host Element - disabled status',
      selectors: ['cck-radio-group--disabled'],
      description: 'Applied to the host element of the Radio Group component, when the all radio group is disabled',
    },
  },
};

export function getRadioGroupClassNames(
  componentProps: ThemeUIComponentProps,
  uiComponentsConfig: ThemeUIComponentsConfig
): Record<keyof typeof radioGroupLayoutClassNamesConfig.elements, string[]> {
  const options: ThemeUIComponentsOptions = {
    componentName: 'radioGroup',
    componentProps,
    uiComponentsConfig,
  };
  validateUiComponentProps(options);
  return {
    host: [
      ...radioGroupLayoutClassNamesConfig.elements.host.selectors,
      ...getHostClassNames(radioGroupLayoutClassNamesConfig.prefix, options),
    ],
    disabled: [...radioGroupLayoutClassNamesConfig.elements.disabled.selectors],
  };
}
