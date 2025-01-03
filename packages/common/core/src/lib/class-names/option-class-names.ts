import { generateLayoutClassNameFromElement } from './class-names';
import { LayoutClassNamesConfig, ThemeConfig, UIBaseComponentProps } from '../model/theme-config.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

export const optionLayoutClassNamesConfig = {
  componentName: 'option',
  baseSelectorStructure: {
    block: 'option',
  },
  elements: {
    host: {
      name: 'Host Element',
      selectorStructure: [],
      description: 'It will add to the host element of Option component.',
    },
    disabled: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'disabled' }],
      description: 'It will add to the host element of Option component, the component is disabled',
    },
    selected: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'selected' }],
      description: 'It will add to the host element of Option component, the option is selected',
    },
    multiple: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'multiple' }],
      description: 'It will add to the host element of option component, when the selection is multi',
    },
    single: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'single' }],
      description: 'It will add to the host element of option component, when the selection is single',
    },
    multipleWrapper: {
      name: 'Multiple Wrapper Element',
      selectorStructure: [{ element: 'multiple-wrapper' }],
      description:
        'It will add to the multiple wrapper element, and this element will be visible when the select is multiple selection',
    },
    contentWrapper: {
      name: 'Wrapper of content',
      selectorStructure: [{ element: 'content-wrapper' }],
      description: 'It will add to the wrapper of option content',
    },
    selectedCheckmark: {
      name: 'Checkmark element',
      selectorStructure: [{ element: 'selected-checkmark' }],
      description:
        'It will add to the selected checkmark element, and this element will be visible when the option is selected',
    },
  },
} satisfies LayoutClassNamesConfig;

export function getOptionClassNames(
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof optionLayoutClassNamesConfig.elements, string> {
  validateUiBaseComponentProps(optionLayoutClassNamesConfig.componentName, componentProps, themeConfig);

  return {
    host: generateLayoutClassNameFromElement(optionLayoutClassNamesConfig, 'host', themeConfig, componentProps),
    disabled: generateLayoutClassNameFromElement(optionLayoutClassNamesConfig, 'disabled', themeConfig),
    selected: generateLayoutClassNameFromElement(optionLayoutClassNamesConfig, 'selected', themeConfig),
    multiple: generateLayoutClassNameFromElement(optionLayoutClassNamesConfig, 'multiple', themeConfig),
    single: generateLayoutClassNameFromElement(optionLayoutClassNamesConfig, 'single', themeConfig),
    multipleWrapper: generateLayoutClassNameFromElement(optionLayoutClassNamesConfig, 'multipleWrapper', themeConfig),
    contentWrapper: generateLayoutClassNameFromElement(optionLayoutClassNamesConfig, 'contentWrapper', themeConfig),
    selectedCheckmark: generateLayoutClassNameFromElement(
      optionLayoutClassNamesConfig,
      'selectedCheckmark',
      themeConfig
    ),
  };
}
