import { getHostClassNames } from './class-names';
import { ThemeUIComponentProps, ThemeUIComponentsConfig, ThemeUIComponentsOptions } from '../model/ui-component.model';
import { validateUiComponentProps } from '../ui-component-props/ui-component-props';

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
  componentProps: ThemeUIComponentProps,
  uiComponentsConfig: ThemeUIComponentsConfig
): Record<keyof typeof suffixLayoutClassNamesConfig.elements, string[]> {
  const options: ThemeUIComponentsOptions = {
    componentName: 'suffix',
    componentProps,
    uiComponentsConfig,
  };
  validateUiComponentProps(options);
  return {
    host: [
      ...suffixLayoutClassNamesConfig.elements.host.selectors,
      ...getHostClassNames(suffixLayoutClassNamesConfig.prefix, options),
    ],
  };
}
