import { getHostClassNames } from './class-names';
import { UIBaseComponentProps, ThemeConfig, CssSelectorGeneratorOptions } from '../model/theme-config.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

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
  themeConfig: ThemeConfig
): Record<keyof typeof chipListLayoutClassNamesConfig.elements, string> {
  const options: CssSelectorGeneratorOptions = {
    componentName: 'chip',
    componentProps,
    themeConfig,
  };
  validateUiBaseComponentProps(options);
  return {
    host: [
      ...chipListLayoutClassNamesConfig.elements.host.selectors,
      ...getHostClassNames(chipListLayoutClassNamesConfig.prefix, options),
    ].join(' '),
    disabled: [...chipListLayoutClassNamesConfig.elements.disabled.selectors].join(' '),
    input: [...chipListLayoutClassNamesConfig.elements.input.selectors].join(' '),
  };
}
