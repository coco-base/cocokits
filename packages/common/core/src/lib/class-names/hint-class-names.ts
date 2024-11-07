import { getHostClassNames } from './class-names';
import { UIBaseComponentProps, ThemeConfig, CssSelectorGeneratorOptions } from '../model/ui-component.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

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
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof hintLayoutClassNamesConfig.elements, string> {
  const options: CssSelectorGeneratorOptions = {
    componentName: 'hint',
    componentProps,
    themeConfig,
  };
  validateUiBaseComponentProps(options);
  return {
    host: [
      ...hintLayoutClassNamesConfig.elements.host.selectors,
      ...getHostClassNames(hintLayoutClassNamesConfig.prefix, options),
    ].join(' '),
  };
}
