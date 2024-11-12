import { getHostClassNames } from './class-names';
import { UIBaseComponentProps, ThemeConfig, CssSelectorGeneratorOptions } from '../model/theme-config.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

export const menuLayoutClassNamesConfig = {
  prefix: 'cck-menu',
  elements: {
    host: {
      name: 'Host Element',
      selectors: ['cck-menu'],
      description: 'It will add to the host element of Menu component.',
    },
    overlay: {
      name: 'Menu Overlay Element',
      selectors: ['cck-menu__overlay'],
      description: 'It will add to the overlay element, when the the menu is opened',
    },
  },
};

export function getMenuClassNames(
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof menuLayoutClassNamesConfig.elements, string> {
  const options: CssSelectorGeneratorOptions = {
    componentName: 'menu',
    componentProps,
    themeConfig,
  };
  validateUiBaseComponentProps(options);
  return {
    host: [
      ...menuLayoutClassNamesConfig.elements.host.selectors,
      ...getHostClassNames(menuLayoutClassNamesConfig.prefix, options),
    ].join(' '),
    overlay: [...menuLayoutClassNamesConfig.elements.overlay.selectors].join(' '),
  };
}
