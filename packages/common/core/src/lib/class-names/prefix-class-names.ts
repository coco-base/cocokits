import { getHostClassNames } from './class-names';
import { ThemeUIComponentProps, ThemeUIComponentsConfig, ThemeUIComponentsOptions } from '../model/ui-component.model';
import { validateUiComponentProps } from '../ui-component-props/ui-component-props';

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
  componentProps: ThemeUIComponentProps,
  uiComponentsConfig: ThemeUIComponentsConfig
): Record<keyof typeof prefixLayoutClassNamesConfig.elements, string> {
  const options: ThemeUIComponentsOptions = {
    componentName: 'prefix',
    componentProps,
    uiComponentsConfig,
  };
  validateUiComponentProps(options);
  return {
    host: [
      ...prefixLayoutClassNamesConfig.elements.host.selectors,
      ...getHostClassNames(prefixLayoutClassNamesConfig.prefix, options),
    ].join(' '),
  };
}
