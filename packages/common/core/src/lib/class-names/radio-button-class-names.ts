import { generateLayoutClassNameFromElement } from './class-names';
import { UIBaseComponentProps, ThemeConfig, LayoutClassNamesConfig } from '../model/theme-config.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

export const radioButtonLayoutClassNamesConfig = {
  componentName: 'radioButton',
  baseSelectorStructure: {
    block: 'radio-button',
  },
  elements: {
    host: {
      name: 'Host Element',
      selectorStructure: [],
      description: 'Applied to the host element of the Radio Button component.',
    },
    wrapper: {
      name: 'Wrapper Element',
      selectorStructure: [{ element: 'wrapper' }],
      description:
        'Applied to a `div` element, child of the `host` element, serving as a wrapper for the radio input and label.',
    },
    inputWrapper: {
      name: 'Input Wrapper Element',
      selectorStructure: [{ element: 'input-wrapper' }],
      description:
        'Applied to a `div` element, child of the `wrapper` element, serving as a wrapper for the radio input and all sub-elements for styling the radio button.',
    },
    input: {
      name: 'Input Element',
      selectorStructure: [{ element: 'input' }],
      description: 'Applied to the `input` element, child of the `inputWrapper`, with type `radio`.',
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
        'Applied to a `div` element containing a `radioButtonBackground` from `ThemeConfig`, child of the `inputWrapper`, to show a custom radio symbol based on the design system concepts.',
    },
    label: {
      name: 'Label Element',
      selectorStructure: [{ element: 'label' }],
      description:
        'Applied to the `label` element, child of the `wrapper`, containing the label or description of the radio.',
    },
    checked: {
      name: 'Host Element - checked status',
      selectorStructure: [{ modifier: 'checked' }],
      description: 'Applied to the host element of the Radio button component, when the the radio is checked',
    },
    unchecked: {
      name: 'Host Element - unchecked status',
      selectorStructure: [{ modifier: 'unchecked' }],
      description: 'Applied to the host element of the Radio button component, when the the radio is unchecked',
    },
    disabled: {
      name: 'Host Element - disabled status',
      selectorStructure: [{ modifier: 'disabled' }],
      description: 'Applied to the host element of the Radio Button component, when the the radio is disabled',
    },
  },
} satisfies LayoutClassNamesConfig;

export function getRadioButtonClassNames(
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof radioButtonLayoutClassNamesConfig.elements, string> {
  validateUiBaseComponentProps(radioButtonLayoutClassNamesConfig.componentName, componentProps, themeConfig);

  return {
    host: generateLayoutClassNameFromElement(radioButtonLayoutClassNamesConfig, 'host', themeConfig, componentProps),
    wrapper: generateLayoutClassNameFromElement(radioButtonLayoutClassNamesConfig, 'wrapper', themeConfig),
    inputWrapper: generateLayoutClassNameFromElement(radioButtonLayoutClassNamesConfig, 'inputWrapper', themeConfig),
    input: generateLayoutClassNameFromElement(radioButtonLayoutClassNamesConfig, 'input', themeConfig),
    backdrop: generateLayoutClassNameFromElement(radioButtonLayoutClassNamesConfig, 'backdrop', themeConfig),
    background: generateLayoutClassNameFromElement(radioButtonLayoutClassNamesConfig, 'background', themeConfig),
    label: generateLayoutClassNameFromElement(radioButtonLayoutClassNamesConfig, 'label', themeConfig),
    checked: generateLayoutClassNameFromElement(radioButtonLayoutClassNamesConfig, 'checked', themeConfig),
    unchecked: generateLayoutClassNameFromElement(radioButtonLayoutClassNamesConfig, 'unchecked', themeConfig),
    disabled: generateLayoutClassNameFromElement(radioButtonLayoutClassNamesConfig, 'disabled', themeConfig),
  };
}
