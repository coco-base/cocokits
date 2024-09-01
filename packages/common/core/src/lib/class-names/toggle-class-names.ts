import { getHostClassNames } from './class-names';
import { ThemeUIComponentProps, ThemeUIComponentsConfig, ThemeUIComponentsOptions } from '../model/ui-component.model';
import { validateUiComponentProps } from '../ui-component-props/ui-component-props';

export const toggleLayoutClassNamesConfig = {
  prefix: 'cck-toggle',
  elements: {
    host: {
      name: 'Host Element',
      selectors: ['cck-toggle'],
      description: 'It will add to the host element of Toggle component.',
    },
    disabled: {
      name: 'Host Element',
      selectors: ['cck-toggle--disabled'],
      description: 'Applied to the host element of the Toggle component, when the the toggle is disabled',
    },
    label: {
      name: 'Label Element',
      selectors: ['cck-toggle__label'],
      description: 'Applied to the `label` element, containing the label or description of the toggle.',
    },
    checked: {
      name: 'Host Element - checked status',
      selectors: ['cck-toggle--checked'],
      description: 'Applied to the host element of the Toggle component, when the the toggle is checked',
    },
    unchecked: {
      name: 'Host Element - unchecked status',
      selectors: ['cck-toggle--unchecked'],
      description: 'Applied to the host element of the Toggle component, when the the toggle is unchecked',
    },
    labelBefore: {
      name: 'Host Element',
      selectors: ['cck-toggle--label-before'],
      description: 'Applied to the host element of the Toggle component, when the the label position is `before`',
    },
    sliderWrapper: {
      name: 'Slider Wrapper Element',
      selectors: ['cck-toggle__slider-wrapper'],
      description: 'It will add to the slider-wrapper element which contains input, thumb and backdrop.',
    },
    input: {
      name: 'Input element',
      selectors: ['cck-toggle__input'],
      description: 'It will add to the input element with typeof checkbox, to track if the toggle is selected or not.',
    },
    thumb: {
      name: 'Knobs Element',
      selectors: ['cck-toggle__thumb'],
      description: 'It will add to the thumb element to style the thumb of toggle.',
    },
    backdrop: {
      name: 'Backdrop Element',
      selectors: ['cck-toggle__backdrop'],
      description: 'It will add to the backdrop element to style the backdrop such as background color.',
    },
  },
};

export function getToggleClassNames(
  componentProps: ThemeUIComponentProps,
  uiComponentsConfig: ThemeUIComponentsConfig
): Record<keyof typeof toggleLayoutClassNamesConfig.elements, string[]> {
  const options: ThemeUIComponentsOptions = {
    componentName: 'toggle',
    componentProps,
    uiComponentsConfig,
  };
  validateUiComponentProps(options);
  return {
    host: [
      ...toggleLayoutClassNamesConfig.elements.host.selectors,
      ...getHostClassNames(toggleLayoutClassNamesConfig.prefix, options),
    ],
    disabled: [...toggleLayoutClassNamesConfig.elements.disabled.selectors],
    label: [...toggleLayoutClassNamesConfig.elements.label.selectors],
    checked: [...toggleLayoutClassNamesConfig.elements.checked.selectors],
    unchecked: [...toggleLayoutClassNamesConfig.elements.unchecked.selectors],
    labelBefore: [...toggleLayoutClassNamesConfig.elements.labelBefore.selectors],
    sliderWrapper: [...toggleLayoutClassNamesConfig.elements.sliderWrapper.selectors],
    input: [...toggleLayoutClassNamesConfig.elements.input.selectors],
    thumb: [...toggleLayoutClassNamesConfig.elements.thumb.selectors],
    backdrop: [...toggleLayoutClassNamesConfig.elements.backdrop.selectors],
  };
}
