import { getHostClassNames } from './class-names';
import { UIBaseComponentProps, ThemeConfig, CssSelectorGeneratorOptions } from '../model/theme-config.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

export const trailingLayoutClassNamesConfig = {
  prefix: 'cck-trailing',
  elements: {
    host: {
      name: 'Host Element',
      selectors: ['cck-trailing'],
      description: 'It will add to the host element of Trailing component.',
    },
    clickable: {
      name: 'Clickable Host Element',
      selectors: ['cck-trailing--clickable'],
      description: 'It will add to the host element of Trailing component, when the element is clickable',
    },
  },
};

export function getTrailingClassNames(
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof trailingLayoutClassNamesConfig.elements, string> {
  const options: CssSelectorGeneratorOptions = {
    componentName: 'trailing',
    componentProps,
    themeConfig,
  };
  validateUiBaseComponentProps(options);
  return {
    host: [
      ...trailingLayoutClassNamesConfig.elements.host.selectors,
      ...getHostClassNames(trailingLayoutClassNamesConfig.prefix, options),
    ].join(' '),
    clickable: [...trailingLayoutClassNamesConfig.elements.clickable.selectors].join(' '),
  };
}
