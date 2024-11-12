import { getHostClassNames } from './class-names';
import { UIBaseComponentProps, ThemeConfig, CssSelectorGeneratorOptions } from '../model/theme-config.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

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
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof radioGroupLayoutClassNamesConfig.elements, string> {
  const options: CssSelectorGeneratorOptions = {
    componentName: 'radioGroup',
    componentProps,
    themeConfig,
  };
  validateUiBaseComponentProps(options);
  return {
    host: [
      ...radioGroupLayoutClassNamesConfig.elements.host.selectors,
      ...getHostClassNames(radioGroupLayoutClassNamesConfig.prefix, options),
    ].join(' '),
    disabled: [...radioGroupLayoutClassNamesConfig.elements.disabled.selectors].join(' '),
  };
}
