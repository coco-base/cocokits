import { getHostClassNames } from './class-names';
import { UIBaseComponentProps, ThemeConfig, CssSelectorGeneratorOptions } from '../model/theme-config.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

export const suffixLayoutClassNamesConfig = {
  prefix: 'cck-suffix',
  elements: {
    host: {
      name: 'Host Element',
      selectors: ['cck-suffix'],
      description: 'It will add to the host element of Suffix component.',
    },
  },
};

export function getSuffixClassNames(
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof suffixLayoutClassNamesConfig.elements, string> {
  const options: CssSelectorGeneratorOptions = {
    componentName: 'suffix',
    componentProps,
    themeConfig,
  };
  validateUiBaseComponentProps(options);
  return {
    host: [
      ...suffixLayoutClassNamesConfig.elements.host.selectors,
      ...getHostClassNames(suffixLayoutClassNamesConfig.prefix, options),
    ].join(' '),
  };
}
