import { getHostClassNames } from './class-names';
import { UIBaseComponentProps, ThemeConfig, CssSelectorGeneratorOptions } from '../model/theme-config.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

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
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof selectPreviewLayoutClassNamesConfig.elements, string> {
  const options: CssSelectorGeneratorOptions = {
    componentName: 'selectPreview',
    componentProps,
    themeConfig,
  };
  validateUiBaseComponentProps(options);
  return {
    host: [
      ...selectPreviewLayoutClassNamesConfig.elements.host.selectors,
      ...getHostClassNames(selectPreviewLayoutClassNamesConfig.prefix, options),
    ].join(' '),
  };
}
