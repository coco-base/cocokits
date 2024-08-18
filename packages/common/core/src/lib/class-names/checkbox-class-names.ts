import { getHostClassNames } from './class-names';
import { ThemeUIComponentProps, ThemeUIComponentsConfig, ThemeUIComponentsOptions } from '../model/ui-component.model';
import { validateUiComponentProps } from '../ui-component-props/ui-component-props';

export const checkboxLayoutClassNamesConfig = {
  prefix: 'cck-checkbox',
  elements: {
    host: {
      name: 'Host Element',
      selectors: ['cck-checkbox'],
      description: 'Applied to the host element of the Checkbox component.',
    },
    wrapper: {
      name: 'Wrapper Element',
      selectors: ['cck-checkbox__wrapper'],
      description:
        'Applied to a `div` element, child of the `host` element, serving as a wrapper for the checkbox input and label.',
    },
    inputWrapper: {
      name: 'Input Wrapper Element',
      selectors: ['cck-checkbox__input-wrapper'],
      description:
        'Applied to a `div` element, child of the `wrapper` element, serving as a wrapper for the checkbox input and all sub-elements for styling the checkbox.',
    },
    input: {
      name: 'Input Element',
      selectors: ['cck-checkbox__input'],
      description: 'Applied to the `input` element, child of the `inputWrapper`, with type `checkbox`.',
    },
    backdrop: {
      name: 'Backdrop Element',
      selectors: ['cck-checkbox__backdrop'],
      description:
        'Applied to an empty `div` element, child of the `inputWrapper`, for additional styling based on the design system concepts. Default styles include full-size `absolute` position and `display: none`. Example usage: Ripple effect.',
    },
    background: {
      name: 'Background Element',
      selectors: ['cck-checkbox__background'],
      description:
        'Applied to a `div` element containing a checkmark SVG from `ThemeUiComponentConfig`, child of the `inputWrapper`, to show a custom checkbox symbol based on the design system concepts.',
    },
    label: {
      name: 'Label Element',
      selectors: ['cck-checkbox__label'],
      description:
        'Applied to the `label` element, child of the `wrapper`, containing the label or description of the checkbox.',
    },
    checked: {
      name: 'Host Element - checked status',
      selectors: ['cck-checkbox--checked'],
      description: 'Applied to the host element of the Checkbox component, when the the checkbox is checked',
    },
    unchecked: {
      name: 'Host Element - unchecked status',
      selectors: ['cck-checkbox--unchecked'],
      description: 'Applied to the host element of the Checkbox component, when the the checkbox is unchecked',
    },
    disabled: {
      name: 'Host Element - disabled status',
      selectors: ['cck-checkbox--disabled'],
      description: 'Applied to the host element of the Checkbox component, when the the checkbox is disabled',
    },
    indeterminate: {
      name: 'Host Element - indeterminate status',
      selectors: ['cck-checkbox--indeterminate'],
      description: 'Applied to the host element of the Checkbox component, when the the checkbox is indeterminate',
    },
  },
};

export function getCheckboxClassNames(
  componentProps: ThemeUIComponentProps,
  uiComponentsConfig: ThemeUIComponentsConfig
): Record<keyof typeof checkboxLayoutClassNamesConfig.elements, string[]> {
  const options: ThemeUIComponentsOptions = {
    componentName: 'checkbox',
    componentProps,
    uiComponentsConfig,
  };
  validateUiComponentProps(options);
  return {
    host: [
      ...checkboxLayoutClassNamesConfig.elements.host.selectors,
      ...getHostClassNames(checkboxLayoutClassNamesConfig.prefix, options),
    ],
    wrapper: [...checkboxLayoutClassNamesConfig.elements.wrapper.selectors],
    inputWrapper: [...checkboxLayoutClassNamesConfig.elements.inputWrapper.selectors],
    input: [...checkboxLayoutClassNamesConfig.elements.input.selectors],
    backdrop: [...checkboxLayoutClassNamesConfig.elements.backdrop.selectors],
    background: [...checkboxLayoutClassNamesConfig.elements.background.selectors],
    label: [...checkboxLayoutClassNamesConfig.elements.label.selectors],
    checked: [...checkboxLayoutClassNamesConfig.elements.checked.selectors],
    unchecked: [...checkboxLayoutClassNamesConfig.elements.unchecked.selectors],
    disabled: [...checkboxLayoutClassNamesConfig.elements.disabled.selectors],
    indeterminate: [...checkboxLayoutClassNamesConfig.elements.indeterminate.selectors],
  };
}
