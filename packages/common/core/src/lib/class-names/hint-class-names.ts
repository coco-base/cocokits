import { getHostClassNames } from './class-names';
import { ThemeUIComponentProps, ThemeUIComponentsConfig, ThemeUIComponentsOptions } from '../model/ui-component.model';
import { validateUiComponentProps } from '../ui-component-props/ui-component-props';

export const hintLayoutClassNamesConfig = {
  prefix: 'cck-hint',
  elements: {
    host: {
      name: 'Host Element',
      selectors: ['cck-hint'],
      description: 'It will add to the host element of Hint component.',
    },
  },
};

export function getHintClassNames(
  componentProps: ThemeUIComponentProps,
  uiComponentsConfig: ThemeUIComponentsConfig
): Record<keyof typeof hintLayoutClassNamesConfig.elements, string> {
  const options: ThemeUIComponentsOptions = {
    componentName: 'hint',
    componentProps,
    uiComponentsConfig,
  };
  validateUiComponentProps(options);
  return {
    host: [
      ...hintLayoutClassNamesConfig.elements.host.selectors,
      ...getHostClassNames(hintLayoutClassNamesConfig.prefix, options),
    ].join(' '),
  };
}
