import { getHostClassNames } from './class-names';
import { ThemeUIComponentProps, ThemeUIComponentsConfig, ThemeUIComponentsOptions } from '../model/ui-component.model';
import { validateUiComponentProps } from '../ui-component-props/ui-component-props';

export const menuLayoutClassNamesConfig = {
  prefix: 'cck-menu',
  elements: {
    host: {
      name: 'Host Element',
      selectors: ['cck-menu'],
      description: 'It will add to the host element of Menu component.',
    },
  },
};

export function getMenuClassNames(
  componentProps: ThemeUIComponentProps,
  uiComponentsConfig: ThemeUIComponentsConfig
): Record<keyof typeof menuLayoutClassNamesConfig.elements, string[]> {
  const options: ThemeUIComponentsOptions = {
    componentName: 'chip',
    componentProps,
    uiComponentsConfig,
  };
  validateUiComponentProps(options);
  return {
    host: [
      ...menuLayoutClassNamesConfig.elements.host.selectors,
      ...getHostClassNames(menuLayoutClassNamesConfig.prefix, options),
    ],
  };
}
