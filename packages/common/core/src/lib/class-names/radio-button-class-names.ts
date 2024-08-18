import { getHostClassNames } from './class-names';
import { ThemeUIComponentProps, ThemeUIComponentsConfig, ThemeUIComponentsOptions } from '../model/ui-component.model';
import { validateUiComponentProps } from '../ui-component-props/ui-component-props';

export const radioButtonLayoutClassNamesConfig = {
  prefix: 'cck-radio-button',
  elements: {
    host: {
      name: 'Host Element',
      selectors: ['cck-radio-button'],
      description: 'Applied to the host element of the Radio Button component.',
    },
    wrapper: {
      name: 'Wrapper Element',
      selectors: ['cck-radio-button__wrapper'],
      description:
        'Applied to a `div` element, child of the `host` element, serving as a wrapper for the radio input and label.',
    },
    inputWrapper: {
      name: 'Input Wrapper Element',
      selectors: ['cck-radio-button__input-wrapper'],
      description:
        'Applied to a `div` element, child of the `wrapper` element, serving as a wrapper for the radio input and all sub-elements for styling the radio button.',
    },
    input: {
      name: 'Input Element',
      selectors: ['cck-radio-button__input'],
      description: 'Applied to the `input` element, child of the `inputWrapper`, with type `radio`.',
    },
    backdrop: {
      name: 'Backdrop Element',
      selectors: ['cck-radio-button__backdrop'],
      description:
        'Applied to an empty `div` element, child of the `inputWrapper`, for additional styling based on the design system concepts. Default styles include full-size `absolute` position and `display: none`. Example usage: Ripple effect.',
    },
    background: {
      name: 'Background Element',
      selectors: ['cck-radio-button__background'],
      description:
        'Applied to a `div` element containing a `radioButtonBackground` from `ThemeUiComponentConfig`, child of the `inputWrapper`, to show a custom radio symbol based on the design system concepts.',
    },
    label: {
      name: 'Label Element',
      selectors: ['cck-radio-button__label'],
      description:
        'Applied to the `label` element, child of the `wrapper`, containing the label or description of the radio.',
    },
    checked: {
      name: 'Host Element - checked status',
      selectors: ['cck-radio-button--checked'],
      description: 'Applied to the host element of the Radio button component, when the the radio is checked',
    },
    unchecked: {
      name: 'Host Element - unchecked status',
      selectors: ['cck-radio-button--unchecked'],
      description: 'Applied to the host element of the Radio button component, when the the radio is unchecked',
    },
    disabled: {
      name: 'Host Element - disabled status',
      selectors: ['cck-radio-button--disabled'],
      description: 'Applied to the host element of the Radio Button component, when the the radio is disabled',
    },
  },
};

export function getRadioButtonClassNames(
  componentProps: ThemeUIComponentProps,
  uiComponentsConfig: ThemeUIComponentsConfig
): Record<keyof typeof radioButtonLayoutClassNamesConfig.elements, string[]> {
  const options: ThemeUIComponentsOptions = {
    componentName: 'radioButton',
    componentProps,
    uiComponentsConfig,
  };
  validateUiComponentProps(options);
  return {
    host: [
      ...radioButtonLayoutClassNamesConfig.elements.host.selectors,
      ...getHostClassNames(radioButtonLayoutClassNamesConfig.prefix, options),
    ],
    wrapper: [...radioButtonLayoutClassNamesConfig.elements.wrapper.selectors],
    inputWrapper: [...radioButtonLayoutClassNamesConfig.elements.inputWrapper.selectors],
    input: [...radioButtonLayoutClassNamesConfig.elements.input.selectors],
    backdrop: [...radioButtonLayoutClassNamesConfig.elements.backdrop.selectors],
    background: [...radioButtonLayoutClassNamesConfig.elements.background.selectors],
    label: [...radioButtonLayoutClassNamesConfig.elements.label.selectors],
    checked: [...radioButtonLayoutClassNamesConfig.elements.checked.selectors],
    unchecked: [...radioButtonLayoutClassNamesConfig.elements.unchecked.selectors],
    disabled: [...radioButtonLayoutClassNamesConfig.elements.disabled.selectors],
  };
}
