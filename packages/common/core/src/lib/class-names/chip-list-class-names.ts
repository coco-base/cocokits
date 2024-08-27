import { getHostClassNames } from './class-names';
import { ThemeUIComponentProps, ThemeUIComponentsConfig, ThemeUIComponentsOptions } from '../model/ui-component.model';
import { validateUiComponentProps } from '../ui-component-props/ui-component-props';

export const chipListLayoutClassNamesConfig = {
  prefix: 'cck-chip-list',
  elements: {
    host: {
      name: 'Host Element',
      selectors: ['cck-chip-list'],
      description: 'It will add to the host element of ChipList component.',
    },
  },
};

export function getChipListClassNames(
  componentProps: ThemeUIComponentProps,
  uiComponentsConfig: ThemeUIComponentsConfig
): Record<keyof typeof chipListLayoutClassNamesConfig.elements, string[]> {
  const options: ThemeUIComponentsOptions = {
    componentName: 'chip',
    componentProps,
    uiComponentsConfig,
  };
  validateUiComponentProps(options);
  return {
    host: [
      ...chipListLayoutClassNamesConfig.elements.host.selectors,
      ...getHostClassNames(chipListLayoutClassNamesConfig.prefix, options),
    ],
  };
}
