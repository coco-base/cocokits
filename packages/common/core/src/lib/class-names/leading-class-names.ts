import { getHostClassNames } from './class-names';
import { UIBaseComponentProps, ThemeConfig, CssSelectorGeneratorOptions } from '../model/ui-component.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

export const leadingLayoutClassNamesConfig = {
  prefix: 'cck-leading',
  elements: {
    host: {
      name: 'Host Element',
      selectors: ['cck-leading'],
      description: 'It will add to the host element of Hint component.',
    },
    clickable: {
      name: 'Clickable Host Element',
      selectors: ['cck-leading--clickable'],
      description: 'It will add to the host element of Leading component, when the element is clickable',
    },
  },
};

export function getLeadingClassNames(
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof leadingLayoutClassNamesConfig.elements, string> {
  const options: CssSelectorGeneratorOptions = {
    componentName: 'leading',
    componentProps,
    themeConfig,
  };
  validateUiBaseComponentProps(options);
  return {
    host: [
      ...leadingLayoutClassNamesConfig.elements.host.selectors,
      ...getHostClassNames(leadingLayoutClassNamesConfig.prefix, options),
    ].join(' '),
    clickable: [...leadingLayoutClassNamesConfig.elements.clickable.selectors].join(' '),
  };
}
