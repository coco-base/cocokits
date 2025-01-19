import { generateLayoutClassNameFromElement } from './class-names';
import { LayoutClassNamesConfig, ThemeConfig, UIBaseComponentProps } from '../model/theme-config.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

export const selectLayoutClassNamesConfig = {
  componentName: 'select',
  baseSelectorStructure: {
    block: 'select',
  },
  elements: {
    host: {
      name: 'Host Element',
      selectorStructure: [],
      description: 'It will add to the host element of Select component.',
    },
    disabled: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'disabled' }],
      description: 'It will add to the host element of Select component, when the component is disabled',
    },
    multiple: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'multiple' }],
      description: 'It will add to the host element of Select component, when the selection is multi',
    },
    opened: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'opened' }],
      description:
        'It will add to the host element of Select component, when overlay to select an option has been opened',
    },
    closed: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'closed' }],
      description: 'It will add to the host element of Select component, when overlay to select an option is closed',
    },
    single: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'single' }],
      description: 'It will add to the host element of Select component, when the selection is single',
    },
    placeholder: {
      name: 'Placeholder Element',
      selectorStructure: [{ element: 'placeholder' }],
      description: 'It will add to the placeholder element of Select component',
    },
    triggerWrapper: {
      name: 'Trigger Wrapper Element',
      selectorStructure: [{ element: 'trigger-wrapper' }],
      description: 'It will add to the element that wrap placeholder, triggerPreview and triggerValue',
    },
    triggerValue: {
      name: 'Trigger Value Element',
      selectorStructure: [{ element: 'trigger-value' }],
      description: 'It will add to the element that contains triggerPreview or triggerValue',
    },
    dropdownIconWrapper: {
      name: 'Dropdown Icon Wrapper Element',
      selectorStructure: [{ element: 'dropdown-icon-wrapper' }],
      description: 'It will add to the element that contains the dropdown icon',
    },
    optionsWrapper: {
      name: 'Options Wrapper Element',
      selectorStructure: [{ element: 'options-wrapper' }],
      description: 'It will add to the options wrapper element that contains the options and optionGroup',
    },
    overlay: {
      name: 'Options Overlay Element',
      selectorStructure: [{ element: 'overlay' }],
      description: 'It will add to the overlay element, the the selection overlay is opened',
    },
  },
} satisfies LayoutClassNamesConfig;

export function getSelectClassNames(
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof selectLayoutClassNamesConfig.elements, string> {
  validateUiBaseComponentProps(selectLayoutClassNamesConfig.componentName, componentProps, themeConfig);

  return {
    host: generateLayoutClassNameFromElement(selectLayoutClassNamesConfig, 'host', themeConfig, componentProps),
    disabled: generateLayoutClassNameFromElement(selectLayoutClassNamesConfig, 'disabled', themeConfig),
    opened: generateLayoutClassNameFromElement(selectLayoutClassNamesConfig, 'opened', themeConfig),
    closed: generateLayoutClassNameFromElement(selectLayoutClassNamesConfig, 'closed', themeConfig),
    multiple: generateLayoutClassNameFromElement(selectLayoutClassNamesConfig, 'multiple', themeConfig),
    single: generateLayoutClassNameFromElement(selectLayoutClassNamesConfig, 'single', themeConfig),
    placeholder: generateLayoutClassNameFromElement(selectLayoutClassNamesConfig, 'placeholder', themeConfig),
    triggerWrapper: generateLayoutClassNameFromElement(selectLayoutClassNamesConfig, 'triggerWrapper', themeConfig),
    triggerValue: generateLayoutClassNameFromElement(selectLayoutClassNamesConfig, 'triggerValue', themeConfig),
    dropdownIconWrapper: generateLayoutClassNameFromElement(
      selectLayoutClassNamesConfig,
      'dropdownIconWrapper',
      themeConfig
    ),
    optionsWrapper: generateLayoutClassNameFromElement(selectLayoutClassNamesConfig, 'optionsWrapper', themeConfig),
    overlay: generateLayoutClassNameFromElement(selectLayoutClassNamesConfig, 'overlay', themeConfig),
  };
}
