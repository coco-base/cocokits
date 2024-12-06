import { generateLayoutClassNameFromElement } from './class-names';
import { UIBaseComponentProps, ThemeConfig, LayoutClassNamesConfig } from '../model/theme-config.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

export const formFieldLayoutClassNamesConfig = {
  componentName: 'formField',
  baseSelectorStructure: {
    block: 'form-field',
  },
  elements: {
    host: {
      name: 'Host Element',
      selectorStructure: [],
      description: 'It will add to the host element of FormField component.',
    },
    wrapper: {
      name: 'Wrapper Element',
      selectorStructure: [{ element: 'wrapper' }],
      description: 'It contains a wrapper element for `leading`, `trailing`, `input-wrapper` elements',
    },
    inputWrapper: {
      name: 'Input Wrapper Element',
      selectorStructure: [{ element: 'input-wrapper' }],
      description: 'It contains a wrapper element for `prefix`, `suffix`, `input` or `chip-list` elements',
    },
    feedbackWrapper: {
      name: 'Feedback Wrapper Element',
      selectorStructure: [{ element: 'feedback-wrapper' }],
      description: 'It contains a wrapper element for `hint` and `error` elements',
    },
    disabled: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'disabled' }],
      description: 'It will add to the host element of FormField component, the component is disabled',
    },
    required: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'required' }],
      description: 'It will add to the host element of FormField component, when the value of input tag is required',
    },
    focused: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'focused' }],
      description: 'It will add to the host element of FormField component, when the input tag is focused',
    },
    untouched: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'untouched' }],
      description: 'It will add to the host element of FormField component, when the value of input tag is untouched',
    },
    touched: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'touched' }],
      description: 'It will add to the host element of FormField component, when the value of input tag is touched',
    },
    pristine: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'pristine' }],
      description: 'It will add to the host element of FormField component, when the value of input tag is pristine',
    },
    dirty: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'dirty' }],
      description: 'It will add to the host element of FormField component, when the value of input tag is dirty',
    },
    valid: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'valid' }],
      description: 'It will add to the host element of FormField component, when the value of input tag is valid',
    },
    invalid: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'invalid' }],
      description: 'It will add to the host element of FormField component, when the value of input tag is invalid',
    },
    pending: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'pending' }],
      description: 'It will add to the host element of FormField component, when the value of input tag is pending',
    },
    error: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'error' }],
      description:
        'It will add to the host element of FormField component, when the value of input is invalid, touched and dirty or error component is present',
    },
    withInput: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'with-input' }],
      description:
        'It will add to the host element of FormField component, when the formFiled component contains input component',
    },
    withTextarea: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'with-textarea' }],
      description:
        'It will add to the host element of FormField component, when the formFiled component contains textarea component',
    },
    withSelect: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'with-select' }],
      description:
        'It will add to the host element of FormField component, when the formFiled component contains select component',
    },
    withChipList: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'with-chip-list' }],
      description:
        'It will add to the host element of FormField component, when the formFiled component contains ChipList component',
    },
  },
} satisfies LayoutClassNamesConfig;

export function getFormFieldClassNames(
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof formFieldLayoutClassNamesConfig.elements, string> {
  validateUiBaseComponentProps(formFieldLayoutClassNamesConfig.componentName, componentProps, themeConfig);

  return {
    host: generateLayoutClassNameFromElement(formFieldLayoutClassNamesConfig, 'host', themeConfig, componentProps),
    wrapper: generateLayoutClassNameFromElement(formFieldLayoutClassNamesConfig, 'wrapper', themeConfig),
    inputWrapper: generateLayoutClassNameFromElement(formFieldLayoutClassNamesConfig, 'inputWrapper', themeConfig),
    feedbackWrapper: generateLayoutClassNameFromElement(
      formFieldLayoutClassNamesConfig,
      'feedbackWrapper',
      themeConfig
    ),
    disabled: generateLayoutClassNameFromElement(formFieldLayoutClassNamesConfig, 'disabled', themeConfig),
    required: generateLayoutClassNameFromElement(formFieldLayoutClassNamesConfig, 'required', themeConfig),
    focused: generateLayoutClassNameFromElement(formFieldLayoutClassNamesConfig, 'focused', themeConfig),
    untouched: generateLayoutClassNameFromElement(formFieldLayoutClassNamesConfig, 'untouched', themeConfig),
    touched: generateLayoutClassNameFromElement(formFieldLayoutClassNamesConfig, 'touched', themeConfig),
    pristine: generateLayoutClassNameFromElement(formFieldLayoutClassNamesConfig, 'pristine', themeConfig),
    dirty: generateLayoutClassNameFromElement(formFieldLayoutClassNamesConfig, 'dirty', themeConfig),
    valid: generateLayoutClassNameFromElement(formFieldLayoutClassNamesConfig, 'valid', themeConfig),
    invalid: generateLayoutClassNameFromElement(formFieldLayoutClassNamesConfig, 'invalid', themeConfig),
    pending: generateLayoutClassNameFromElement(formFieldLayoutClassNamesConfig, 'pending', themeConfig),
    error: generateLayoutClassNameFromElement(formFieldLayoutClassNamesConfig, 'error', themeConfig),
    withInput: generateLayoutClassNameFromElement(formFieldLayoutClassNamesConfig, 'withInput', themeConfig),
    withTextarea: generateLayoutClassNameFromElement(formFieldLayoutClassNamesConfig, 'withTextarea', themeConfig),
    withSelect: generateLayoutClassNameFromElement(formFieldLayoutClassNamesConfig, 'withSelect', themeConfig),
    withChipList: generateLayoutClassNameFromElement(formFieldLayoutClassNamesConfig, 'withChipList', themeConfig),
  };
}
