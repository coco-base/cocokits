import { getHostClassNames } from './class-names';
import { UIBaseComponentProps, ThemeConfig, CssSelectorGeneratorOptions } from '../model/theme-config.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

export const prefixLayoutClassNamesConfig = {
  prefix: 'cck-prefix',
  elements: {
    host: {
      name: 'Host Element',
      selectors: ['cck-prefix'],
      description: 'It will add to the host element of Prefix component.',
    },
  },
};

export function getPrefixClassNames(
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof prefixLayoutClassNamesConfig.elements, string> {
  const options: CssSelectorGeneratorOptions = {
    componentName: 'prefix',
    componentProps,
    themeConfig,
  };
  validateUiBaseComponentProps(options);
  return {
    host: [
      ...prefixLayoutClassNamesConfig.elements.host.selectors,
      ...getHostClassNames(prefixLayoutClassNamesConfig.prefix, options),
    ].join(' '),
  };
}
