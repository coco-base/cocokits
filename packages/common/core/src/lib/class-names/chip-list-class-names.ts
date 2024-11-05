import { getHostClassNames } from './class-names';
import { UIBaseComponentProps, ThemeUIComponentsConfig, ThemeUIComponentsOptions } from '../model/ui-component.model';
import { validateUiComponentProps } from '../ui-component-props/ui-component-props';

export const chipListLayoutClassNamesConfig = {
  prefix: 'cck-chip-list',
  elements: {
    host: {
      name: 'Host Element',
      selectors: ['cck-chip-list'],
      description: 'It will add to the host element of ChipList component.',
    },
    disabled: {
      name: 'Host Element',
      selectors: ['cck-chip-list--disabled'],
      description: 'Applied to the host element of the ChipList component, when the the ChipList is disabled',
    },
    input: {
      name: 'Host Element',
      selectors: ['cck-chip-list__input'],
      description: 'Applied to the input element of the ChipList component, to write and add new chip',
    },
  },
};

export function getChipListClassNames(
  componentProps: UIBaseComponentProps,
  uiComponentsConfig: ThemeUIComponentsConfig
): Record<keyof typeof chipListLayoutClassNamesConfig.elements, string> {
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
    ].join(' '),
    disabled: [...chipListLayoutClassNamesConfig.elements.disabled.selectors].join(' '),
    input: [...chipListLayoutClassNamesConfig.elements.input.selectors].join(' '),
  };
}
