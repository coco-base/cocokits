import { getHostClassNames } from './class-names';
import { UIBaseComponentProps, ThemeConfig, CssSelectorGeneratorOptions } from '../model/ui-component.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

export const menuItemLayoutClassNamesConfig = {
  prefix: 'cck-menu-item',
  elements: {
    host: {
      name: 'Host Element',
      selectors: ['cck-menu-item'],
      description: 'It will add to the host element of MenuItem component.',
    },
    disabled: {
      name: 'Host Element',
      selectors: ['cck-menu-item--disabled'],
      description:
        'Applied to the host element of the MenuItem component, when the the menu item or menu group is disabled',
    },
  },
};

export function getMenuItemClassNames(
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof menuItemLayoutClassNamesConfig.elements, string> {
  const options: CssSelectorGeneratorOptions = {
    componentName: 'menuItem',
    componentProps,
    themeConfig,
  };
  validateUiBaseComponentProps(options);
  return {
    host: [
      ...menuItemLayoutClassNamesConfig.elements.host.selectors,
      ...getHostClassNames(menuItemLayoutClassNamesConfig.prefix, options),
    ].join(' '),
    disabled: [...menuItemLayoutClassNamesConfig.elements.disabled.selectors].join(' '),
  };
}
