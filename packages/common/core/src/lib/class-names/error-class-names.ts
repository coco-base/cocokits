import { getHostClassNames } from './class-names';
import { ThemeUIComponentProps, ThemeUIComponentsConfig, ThemeUIComponentsOptions } from '../model/ui-component.model';
import { validateUiComponentProps } from '../ui-component-props/ui-component-props';

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
  componentProps: ThemeUIComponentProps,
  uiComponentsConfig: ThemeUIComponentsConfig
): Record<keyof typeof errorLayoutClassNamesConfig.elements, string> {
  const options: ThemeUIComponentsOptions = {
    componentName: 'error',
    componentProps,
    uiComponentsConfig,
  };
  validateUiComponentProps(options);
  return {
    host: [
      ...errorLayoutClassNamesConfig.elements.host.selectors,
      ...getHostClassNames(errorLayoutClassNamesConfig.prefix, options),
    ].join(' '),
  };
}
