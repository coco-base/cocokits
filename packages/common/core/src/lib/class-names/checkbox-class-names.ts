import { generateLayoutClassNameFromElement } from './class-names';
import { UIBaseComponentProps, ThemeConfig, LayoutClassNamesConfig } from '../model/theme-config.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

export const checkboxLayoutClassNamesConfig = {
  componentName: 'checkbox',
  baseSelectorStructure: {
    block: 'checkbox',
  },
  elements: {
    host: {
      name: 'Host Element',
      selectorStructure: [],
      description: 'Applied to the host element of the Checkbox component.',
    },
    wrapper: {
      name: 'Wrapper Element',
      selectorStructure: [{ element: 'wrapper' }],
      description:
        'Applied to a `div` element, child of the `host` element, serving as a wrapper for the checkbox input and label.',
    },
    inputWrapper: {
      name: 'Input Wrapper Element',
      selectorStructure: [{ element: 'input-wrapper' }],
      description:
        'Applied to a `div` element, child of the `wrapper` element, serving as a wrapper for the checkbox input and all sub-elements for styling the checkbox.',
    },
    input: {
      name: 'Input Element',
      selectorStructure: [{ element: 'input' }],
      description: 'Applied to the `input` element, child of the `inputWrapper`, with type `checkbox`.',
    },
    backdrop: {
      name: 'Backdrop Element',
      selectorStructure: [{ element: 'backdrop' }],
      description:
        'Applied to an empty `div` element, child of the `inputWrapper`, for additional styling based on the design system concepts. Default styles include full-size `absolute` position and `display: none`. Example usage: Ripple effect.',
    },
    background: {
      name: 'Background Element',
      selectorStructure: [{ element: 'background' }],
      description:
        'Applied to a `div` element containing a checkmark SVG from `ThemeConfig`, child of the `inputWrapper`, to show a custom checkbox symbol based on the design system concepts.',
    },
    label: {
      name: 'Label Element',
      selectorStructure: [{ element: 'label' }],
      description:
        'Applied to the `label` element, child of the `wrapper`, containing the label or description of the checkbox.',
    },
    checked: {
      name: 'Host Element - checked status',
      selectorStructure: [{ modifier: 'checked' }],
      description: 'Applied to the host element of the Checkbox component, when the checkbox is checked',
    },
    unchecked: {
      name: 'Host Element - unchecked status',
      selectorStructure: [{ modifier: 'unchecked' }],
      description: 'Applied to the host element of the Checkbox component, when the checkbox is unchecked',
    },
    disabled: {
      name: 'Host Element - disabled status',
      selectorStructure: [{ modifier: 'disabled' }],
      description: 'Applied to the host element of the Checkbox component, when the checkbox is disabled',
    },
    indeterminate: {
      name: 'Host Element - indeterminate status',
      selectorStructure: [{ modifier: 'indeterminate' }],
      description: 'Applied to the host element of the Checkbox component, when the checkbox is indeterminate',
    },
  },
} satisfies LayoutClassNamesConfig;

export function getCheckboxClassNames(
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof checkboxLayoutClassNamesConfig.elements, string> {
  validateUiBaseComponentProps(checkboxLayoutClassNamesConfig.componentName, componentProps, themeConfig);

  return {
    host: generateLayoutClassNameFromElement(checkboxLayoutClassNamesConfig, 'host', themeConfig, componentProps),
    wrapper: generateLayoutClassNameFromElement(checkboxLayoutClassNamesConfig, 'wrapper', themeConfig),
    inputWrapper: generateLayoutClassNameFromElement(checkboxLayoutClassNamesConfig, 'inputWrapper', themeConfig),
    input: generateLayoutClassNameFromElement(checkboxLayoutClassNamesConfig, 'input', themeConfig),
    backdrop: generateLayoutClassNameFromElement(checkboxLayoutClassNamesConfig, 'backdrop', themeConfig),
    background: generateLayoutClassNameFromElement(checkboxLayoutClassNamesConfig, 'background', themeConfig),
    label: generateLayoutClassNameFromElement(checkboxLayoutClassNamesConfig, 'label', themeConfig),
    checked: generateLayoutClassNameFromElement(checkboxLayoutClassNamesConfig, 'checked', themeConfig),
    unchecked: generateLayoutClassNameFromElement(checkboxLayoutClassNamesConfig, 'unchecked', themeConfig),
    disabled: generateLayoutClassNameFromElement(checkboxLayoutClassNamesConfig, 'disabled', themeConfig),
    indeterminate: generateLayoutClassNameFromElement(checkboxLayoutClassNamesConfig, 'indeterminate', themeConfig),
  };
}
