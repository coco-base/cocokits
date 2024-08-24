import { getHostClassNames } from './class-names';
import { ThemeUIComponentProps, ThemeUIComponentsConfig, ThemeUIComponentsOptions } from '../model/ui-component.model';
import { validateUiComponentProps } from '../ui-component-props/ui-component-props';

export const selectLayoutClassNamesConfig = {
  prefix: 'cck-select',
  elements: {
    host: {
      name: 'Host Element',
      selectors: ['cck-select'],
      description: 'It will add to the host element of Select component.',
    },
  },
};

export function getSelectClassNames(
  componentProps: ThemeUIComponentProps,
  uiComponentsConfig: ThemeUIComponentsConfig
): Record<keyof typeof selectLayoutClassNamesConfig.elements, string[]> {
  const options: ThemeUIComponentsOptions = {
    componentName: 'select',
    componentProps,
    uiComponentsConfig,
  };
  validateUiComponentProps(options);
  return {
    host: [
      ...selectLayoutClassNamesConfig.elements.host.selectors,
      ...getHostClassNames(selectLayoutClassNamesConfig.prefix, options),
    ],
  };
}
