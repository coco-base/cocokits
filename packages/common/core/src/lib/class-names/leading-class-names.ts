import { getHostClassNames } from './class-names';
import { ThemeUIComponentProps, ThemeUIComponentsConfig, ThemeUIComponentsOptions } from '../model/ui-component.model';
import { validateUiComponentProps } from '../ui-component-props/ui-component-props';

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
  componentProps: ThemeUIComponentProps,
  uiComponentsConfig: ThemeUIComponentsConfig
): Record<keyof typeof leadingLayoutClassNamesConfig.elements, string[]> {
  const options: ThemeUIComponentsOptions = {
    componentName: 'leading',
    componentProps,
    uiComponentsConfig,
  };
  validateUiComponentProps(options);
  return {
    host: [
      ...leadingLayoutClassNamesConfig.elements.host.selectors,
      ...getHostClassNames(leadingLayoutClassNamesConfig.prefix, options),
    ],
    clickable: [...leadingLayoutClassNamesConfig.elements.clickable.selectors],
  };
}
