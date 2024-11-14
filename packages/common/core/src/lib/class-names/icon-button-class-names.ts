import { generateLayoutClassNameFromElement } from './class-names';
import { UIBaseComponentProps, ThemeConfig, LayoutClassNamesConfig } from '../model/theme-config.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

export const iconButtonLayoutClassNamesConfig = {
  componentName: 'iconButton',
  baseSelectorStructure: {
    block: 'icon-button',
  },
  elements: {
    host: {
      name: 'Host Element',
      selectorStructure: [],
      description:
        'It will add to the host element of IconButton component. The default style has `relative` position.',
    },
    backdrop: {
      name: 'Backdrop Element',
      selectorStructure: [{ element: 'backdrop' }],
      description:
        'It is an empty `div` added to the host element to add more style based on the design system concepts. (For example the Ripple effect). The default styles are full size `absolute` position and `display: none`',
    },
  },
} satisfies LayoutClassNamesConfig;

export function getIconButtonClassNames(
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof iconButtonLayoutClassNamesConfig.elements, string> {
  validateUiBaseComponentProps(iconButtonLayoutClassNamesConfig.componentName, componentProps, themeConfig);

  return {
    host: generateLayoutClassNameFromElement(iconButtonLayoutClassNamesConfig, 'host', themeConfig, componentProps),
    backdrop: generateLayoutClassNameFromElement(iconButtonLayoutClassNamesConfig, 'backdrop', themeConfig),
  };
}
