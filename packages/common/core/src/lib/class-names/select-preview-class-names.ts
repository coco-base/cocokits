import { getHostClassNames } from './class-names';
import { ThemeUIComponentProps, ThemeUIComponentsConfig, ThemeUIComponentsOptions } from '../model/ui-component.model';
import { validateUiComponentProps } from '../ui-component-props/ui-component-props';

export const selectPreviewLayoutClassNamesConfig = {
  prefix: 'cck-select-preview',
  elements: {
    host: {
      name: 'Host Element',
      selectors: ['cck-select-preview'],
      description: 'It will add to the host element of SelectPreview component.',
    },
  },
};

export function getSelectPreviewClassNames(
  componentProps: ThemeUIComponentProps,
  uiComponentsConfig: ThemeUIComponentsConfig
): Record<keyof typeof selectPreviewLayoutClassNamesConfig.elements, string[]> {
  const options: ThemeUIComponentsOptions = {
    componentName: 'selectPreview',
    componentProps,
    uiComponentsConfig,
  };
  validateUiComponentProps(options);
  return {
    host: [
      ...selectPreviewLayoutClassNamesConfig.elements.host.selectors,
      ...getHostClassNames(selectPreviewLayoutClassNamesConfig.prefix, options),
    ],
  };
}
