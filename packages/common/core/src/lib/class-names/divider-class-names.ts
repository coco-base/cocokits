import { getHostClassNames } from './class-names';
import { ThemeUIComponentProps, ThemeUIComponentsConfig, ThemeUIComponentsOptions } from '../model/ui-component.model';
import { validateUiComponentProps } from '../ui-component-props/ui-component-props';

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
  componentProps: ThemeUIComponentProps,
  uiComponentsConfig: ThemeUIComponentsConfig
): Record<keyof typeof dividerLayoutClassNamesConfig.elements, string> {
  const options: ThemeUIComponentsOptions = {
    componentName: 'divider',
    componentProps,
    uiComponentsConfig,
  };
  validateUiComponentProps(options);
  return {
    host: [
      ...dividerLayoutClassNamesConfig.elements.host.selectors,
      ...getHostClassNames(dividerLayoutClassNamesConfig.prefix, options),
    ].join(' '),
  };
}
