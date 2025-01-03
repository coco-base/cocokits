import { generateLayoutClassNameFromElement } from './class-names';
import { LayoutClassNamesConfig, ThemeConfig, UIBaseComponentProps } from '../model/theme-config.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

export const chipLayoutClassNamesConfig = {
  componentName: 'chip',
  baseSelectorStructure: {
    block: 'chip',
  },
  elements: {
    host: {
      name: 'Host Element',
      selectorStructure: [],
      description: 'It will add to the host element of Chip component.',
    },
    disabled: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'disabled' }],
      description: 'Applied to the host element of the Chip component, when the chip is disabled',
    },
    removable: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'removable' }],
      description: 'Applied to the host element of the Chip component, when the chip is removable',
    },
    contentWrapper: {
      name: 'Wrapper of content',
      selectorStructure: [{ element: 'content-wrapper' }],
      description: 'It will add to the wrapper of content element.',
    },
    removeIconWrapper: {
      name: 'Wrapper of remove icon',
      selectorStructure: [{ element: 'remove-icon-wrapper' }],
      description: 'It will add to the wrapper of remove icon element.',
    },
  },
} satisfies LayoutClassNamesConfig;

export function getChipClassNames(
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof chipLayoutClassNamesConfig.elements, string> {
  validateUiBaseComponentProps(chipLayoutClassNamesConfig.componentName, componentProps, themeConfig);

  return {
    host: generateLayoutClassNameFromElement(chipLayoutClassNamesConfig, 'host', themeConfig, componentProps),
    disabled: generateLayoutClassNameFromElement(chipLayoutClassNamesConfig, 'disabled', themeConfig),
    removable: generateLayoutClassNameFromElement(chipLayoutClassNamesConfig, 'removable', themeConfig),
    contentWrapper: generateLayoutClassNameFromElement(chipLayoutClassNamesConfig, 'contentWrapper', themeConfig),
    removeIconWrapper: generateLayoutClassNameFromElement(chipLayoutClassNamesConfig, 'removeIconWrapper', themeConfig),
  };
}
