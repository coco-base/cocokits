import { generateLayoutClassNameFromElement } from './class-names';
import { LayoutClassNamesConfig, ThemeConfig, UIBaseComponentProps } from '../model/theme-config.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

export const menuLayoutClassNamesConfig = {
  componentName: 'menu',
  baseSelectorStructure: {
    block: 'menu',
  },
  elements: {
    host: {
      name: 'Host Element',
      selectorStructure: [],
      description: 'It will add to the host element of Menu component.',
    },
    overlay: {
      name: 'Menu Overlay Element',
      selectorStructure: [{ element: 'overlay' }],
      description: 'It will add to the overlay element, when the menu is opened',
    },
  },
} satisfies LayoutClassNamesConfig;

export function getMenuClassNames(
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof menuLayoutClassNamesConfig.elements, string> {
  validateUiBaseComponentProps(menuLayoutClassNamesConfig.componentName, componentProps, themeConfig);

  return {
    host: generateLayoutClassNameFromElement(menuLayoutClassNamesConfig, 'host', themeConfig, componentProps),
    overlay: generateLayoutClassNameFromElement(menuLayoutClassNamesConfig, 'overlay', themeConfig),
  };
}
