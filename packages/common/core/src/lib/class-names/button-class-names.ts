import { generateLayoutClassNameFromElement } from './class-names';
import { LayoutClassNamesConfig, ThemeConfig, UIBaseComponentProps } from '../model/theme-config.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

export const buttonLayoutClassNamesConfig = {
  componentName: 'button',
  baseSelectorStructure: { block: 'button' },
  elements: {
    host: {
      name: 'Host Element',
      selectorStructure: [],
      description: 'It will add to the host element of Button component. The default style has `relative` position.',
    },
    backdrop: {
      name: 'Backdrop Element',
      selectorStructure: [{ element: 'backdrop' }],
      description:
        'It is an empty `div` added to the host element to add more style based on the design system concepts. (For example the Ripple effect). The default styles are full size `absolute` position and `display: none`',
    },
  },
} satisfies LayoutClassNamesConfig;

export function getButtonClassNames(
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof buttonLayoutClassNamesConfig.elements, string> {
  validateUiBaseComponentProps(buttonLayoutClassNamesConfig.componentName, componentProps, themeConfig);

  return {
    host: generateLayoutClassNameFromElement(buttonLayoutClassNamesConfig, 'host', themeConfig, componentProps),
    backdrop: generateLayoutClassNameFromElement(buttonLayoutClassNamesConfig, 'backdrop', themeConfig),
  };
}
