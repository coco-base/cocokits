import { getHostClassNames } from './class-names';
import { ThemeUIComponentProps, ThemeUIComponentsConfig, ThemeUIComponentsOptions } from '../model/ui-component.model';
import { validateUiComponentProps } from '../ui-component-props/ui-component-props';

export const chipLayoutClassNamesConfig = {
  prefix: 'cck-chip',
  elements: {
    host: {
      name: 'Host Element',
      selectors: ['cck-chip'],
      description: 'It will add to the host element of Chip component.',
    },
  },
};

export function getChipClassNames(
  componentProps: ThemeUIComponentProps,
  uiComponentsConfig: ThemeUIComponentsConfig
): Record<keyof typeof chipLayoutClassNamesConfig.elements, string[]> {
  const options: ThemeUIComponentsOptions = {
    componentName: 'chip',
    componentProps,
    uiComponentsConfig,
  };
  validateUiComponentProps(options);
  return {
    host: [
      ...chipLayoutClassNamesConfig.elements.host.selectors,
      ...getHostClassNames(chipLayoutClassNamesConfig.prefix, options),
    ],
  };
}
