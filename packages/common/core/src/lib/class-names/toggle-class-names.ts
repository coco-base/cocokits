import { generateLayoutClassNameFromElement } from './class-names';
import { LayoutClassNamesConfig, ThemeConfig, UIBaseComponentProps } from '../model/theme-config.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

export const toggleLayoutClassNamesConfig = {
  componentName: 'toggle',
  baseSelectorStructure: {
    block: 'toggle',
  },
  elements: {
    host: {
      name: 'Host Element',
      selectorStructure: [],
      description: 'It will add to the host element of Toggle component.',
    },
    disabled: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'disabled' }],
      description: 'Applied to the host element of the Toggle component, when the toggle is disabled',
    },
    label: {
      name: 'Label Element',
      selectorStructure: [{ element: 'label' }],
      description: 'Applied to the `label` element, containing the label or description of the toggle.',
    },
    checked: {
      name: 'Host Element - checked status',
      selectorStructure: [{ modifier: 'checked' }],
      description: 'Applied to the host element of the Toggle component, when the toggle is checked',
    },
    unchecked: {
      name: 'Host Element - unchecked status',
      selectorStructure: [{ modifier: 'unchecked' }],
      description: 'Applied to the host element of the Toggle component, when the toggle is unchecked',
    },
    labelBefore: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'label-before' }],
      description: 'Applied to the host element of the Toggle component, when the label position is `before`',
    },
    sliderWrapper: {
      name: 'Slider Wrapper Element',
      selectorStructure: [{ element: 'slider-wrapper' }],
      description: 'It will add to the slider-wrapper element which contains input, thumb and backdrop.',
    },
    input: {
      name: 'Input element',
      selectorStructure: [{ element: 'input' }],
      description: 'It will add to the input element with typeof checkbox, to track if the toggle is selected or not.',
    },
    thumb: {
      name: 'Knobs Element',
      selectorStructure: [{ element: 'thumb' }],
      description: 'It will add to the thumb element to style the thumb of toggle.',
    },
    backdrop: {
      name: 'Backdrop Element',
      selectorStructure: [{ element: 'backdrop' }],
      description: 'It will add to the backdrop element to style the backdrop such as background color.',
    },
  },
} satisfies LayoutClassNamesConfig;

export function getToggleClassNames(
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof toggleLayoutClassNamesConfig.elements, string> {
  validateUiBaseComponentProps(toggleLayoutClassNamesConfig.componentName, componentProps, themeConfig);

  return {
    host: generateLayoutClassNameFromElement(toggleLayoutClassNamesConfig, 'host', themeConfig, componentProps),
    disabled: generateLayoutClassNameFromElement(toggleLayoutClassNamesConfig, 'disabled', themeConfig),
    label: generateLayoutClassNameFromElement(toggleLayoutClassNamesConfig, 'label', themeConfig),
    checked: generateLayoutClassNameFromElement(toggleLayoutClassNamesConfig, 'checked', themeConfig),
    unchecked: generateLayoutClassNameFromElement(toggleLayoutClassNamesConfig, 'unchecked', themeConfig),
    labelBefore: generateLayoutClassNameFromElement(toggleLayoutClassNamesConfig, 'labelBefore', themeConfig),
    sliderWrapper: generateLayoutClassNameFromElement(toggleLayoutClassNamesConfig, 'sliderWrapper', themeConfig),
    input: generateLayoutClassNameFromElement(toggleLayoutClassNamesConfig, 'input', themeConfig),
    thumb: generateLayoutClassNameFromElement(toggleLayoutClassNamesConfig, 'thumb', themeConfig),
    backdrop: generateLayoutClassNameFromElement(toggleLayoutClassNamesConfig, 'backdrop', themeConfig),
  };
}
