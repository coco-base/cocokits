import { getHostClassNames } from './class-names';
import { ThemeUIComponentProps, ThemeUIComponentsConfig, ThemeUIComponentsOptions } from '../model/ui-component.model';
import { validateUiComponentProps } from '../ui-component-props/ui-component-props';

export const inputLayoutClassNamesConfig = {
  prefix: 'cck-input',
  elements: {
    host: {
      name: 'Host Element',
      selectors: ['cck-input'],
      description: 'It will add to the host element of Input component.',
    },
    disabled: {
      name: 'Host Element',
      selectors: ['cck-input--disabled'],
      description: 'It will add to the host element of Input component, the component is disabled',
    },
  },
};

export function getInputClassNames(
  componentProps: ThemeUIComponentProps,
  uiComponentsConfig: ThemeUIComponentsConfig
): Record<keyof typeof inputLayoutClassNamesConfig.elements, string[]> {
  const options: ThemeUIComponentsOptions = {
    componentName: 'input',
    componentProps,
    uiComponentsConfig,
  };
  validateUiComponentProps(options);
  return {
    host: [
      ...inputLayoutClassNamesConfig.elements.host.selectors,
      ...getHostClassNames(inputLayoutClassNamesConfig.prefix, options),
    ],
    disabled: [...inputLayoutClassNamesConfig.elements.disabled.selectors],
  };
}
