import { getHostClassNames } from './class-names';
import { UIBaseComponentProps, ThemeConfig, CssSelectorGeneratorOptions } from '../model/ui-component.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

export const errorLayoutClassNamesConfig = {
  prefix: 'cck-error',
  elements: {
    host: {
      name: 'Host Element',
      selectors: ['cck-error'],
      description: 'It will add to the host element of Error component.',
    },
  },
};

export function getErrorClassNames(
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof errorLayoutClassNamesConfig.elements, string> {
  const options: CssSelectorGeneratorOptions = {
    componentName: 'error',
    componentProps,
    themeConfig,
  };
  validateUiBaseComponentProps(options);
  return {
    host: [
      ...errorLayoutClassNamesConfig.elements.host.selectors,
      ...getHostClassNames(errorLayoutClassNamesConfig.prefix, options),
    ].join(' '),
  };
}
