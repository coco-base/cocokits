import { getHostClassNames } from './class-names';
import { ThemeUIComponentProps, ThemeUIComponentsConfig, ThemeUIComponentsOptions } from '../model/ui-component.model';
import { validateUiComponentProps } from '../ui-component-props/ui-component-props';

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
  componentProps: ThemeUIComponentProps,
  uiComponentsConfig: ThemeUIComponentsConfig
): Record<keyof typeof trailingLayoutClassNamesConfig.elements, string> {
  const options: ThemeUIComponentsOptions = {
    componentName: 'trailing',
    componentProps,
    uiComponentsConfig,
  };
  validateUiComponentProps(options);
  return {
    host: [
      ...trailingLayoutClassNamesConfig.elements.host.selectors,
      ...getHostClassNames(trailingLayoutClassNamesConfig.prefix, options),
    ].join(' '),
    clickable: [...trailingLayoutClassNamesConfig.elements.clickable.selectors].join(' '),
  };
}
