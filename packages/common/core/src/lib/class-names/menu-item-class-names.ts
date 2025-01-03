import { generateLayoutClassNameFromElement } from './class-names';
import { LayoutClassNamesConfig, ThemeConfig, UIBaseComponentProps } from '../model/theme-config.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

export const menuItemLayoutClassNamesConfig = {
  componentName: 'menuItem',
  baseSelectorStructure: {
    block: 'menu-item',
  },
  elements: {
    host: {
      name: 'Host Element',
      selectorStructure: [],
      description: 'It will add to the host element of MenuItem component.',
    },
    disabled: {
      name: 'Disabled Element',
      selectorStructure: [{ modifier: 'disabled' }],
      description:
        'Applied to the host element of the MenuItem component, when the menu item or menu group is disabled',
    },
  },
} satisfies LayoutClassNamesConfig;

export function getMenuItemClassNames(
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof menuItemLayoutClassNamesConfig.elements, string> {
  validateUiBaseComponentProps(menuItemLayoutClassNamesConfig.componentName, componentProps, themeConfig);

  return {
    host: generateLayoutClassNameFromElement(menuItemLayoutClassNamesConfig, 'host', themeConfig, componentProps),
    disabled: generateLayoutClassNameFromElement(menuItemLayoutClassNamesConfig, 'disabled', themeConfig),
  };
}
