import { generateLayoutClassNameFromElement } from './class-names';
import { UIBaseComponentProps, ThemeConfig, LayoutClassNamesConfig } from '../model/theme-config.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

export const chipListLayoutClassNamesConfig = {
  componentName: 'chipList',
  baseSelectorStructure: {
    block: 'chip-list',
  },
  elements: {
    host: {
      name: 'Host Element',
      selectorStructure: [],
      description: 'It will add to the host element of ChipList component.',
    },
    disabled: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'disabled' }],
      description: 'Applied to the host element of the ChipList component, when the ChipList is disabled',
    },
    input: {
      name: 'Host Element',
      selectorStructure: [{ element: 'input' }],
      description: 'Applied to the input element of the ChipList component, to write and add new chip',
    },
  },
} satisfies LayoutClassNamesConfig;

export function getChipListClassNames(
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof chipListLayoutClassNamesConfig.elements, string> {
  validateUiBaseComponentProps(chipListLayoutClassNamesConfig.componentName, componentProps, themeConfig);

  return {
    host: generateLayoutClassNameFromElement(chipListLayoutClassNamesConfig, 'host', themeConfig, componentProps),
    disabled: generateLayoutClassNameFromElement(chipListLayoutClassNamesConfig, 'disabled', themeConfig),
    input: generateLayoutClassNameFromElement(chipListLayoutClassNamesConfig, 'input', themeConfig),
  };
}
