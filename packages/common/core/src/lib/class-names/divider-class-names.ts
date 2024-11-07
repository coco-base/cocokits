import { getHostClassNames } from './class-names';
import { UIBaseComponentProps, ThemeConfig, CssSelectorGeneratorOptions } from '../model/ui-component.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

export const dividerLayoutClassNamesConfig = {
  prefix: 'cck-divider',
  elements: {
    host: {
      name: 'Host Element',
      selectors: ['cck-divider'],
      description: 'It will add to the host element of Divider component.',
    },
  },
};

export function getDividerClassNames(
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof dividerLayoutClassNamesConfig.elements, string> {
  const options: CssSelectorGeneratorOptions = {
    componentName: 'divider',
    componentProps,
    themeConfig,
  };
  validateUiBaseComponentProps(options);
  return {
    host: [
      ...dividerLayoutClassNamesConfig.elements.host.selectors,
      ...getHostClassNames(dividerLayoutClassNamesConfig.prefix, options),
    ].join(' '),
  };
}
