import { getHostClassNames } from './class-names';
import { ThemeUIComponentProps, ThemeUIComponentsConfig, ThemeUIComponentsOptions } from '../model/ui-component.model';
import { validateUiComponentProps } from '../ui-component-props/ui-component-props';

export const textareaClassNamesConfig = {
  prefix: 'cck-textarea',
  elements: {
    host: {
      name: 'Host Element',
      selectors: ['cck-textarea'],
      description: 'It will add to the host element of textarea component.',
    },
  },
};

export function getTextareaClassNames(
  componentProps: ThemeUIComponentProps,
  uiComponentsConfig: ThemeUIComponentsConfig
): Record<keyof typeof textareaClassNamesConfig.elements, string[]> {
  const options: ThemeUIComponentsOptions = {
    componentName: 'textarea',
    componentProps,
    uiComponentsConfig,
  };
  validateUiComponentProps(options);
  return {
    host: [
      ...textareaClassNamesConfig.elements.host.selectors,
      ...getHostClassNames(textareaClassNamesConfig.prefix, options),
    ],
  };
}
