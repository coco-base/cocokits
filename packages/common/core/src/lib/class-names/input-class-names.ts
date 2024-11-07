import { getHostClassNames } from './class-names';
import { UIBaseComponentProps, ThemeConfig, CssSelectorGeneratorOptions } from '../model/ui-component.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

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
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof inputLayoutClassNamesConfig.elements, string> {
  const options: CssSelectorGeneratorOptions = {
    componentName: 'input',
    componentProps,
    themeConfig,
  };
  validateUiBaseComponentProps(options);
  return {
    host: [
      ...inputLayoutClassNamesConfig.elements.host.selectors,
      ...getHostClassNames(inputLayoutClassNamesConfig.prefix, options),
    ].join(' '),
    disabled: [...inputLayoutClassNamesConfig.elements.disabled.selectors].join(' '),
  };
}
