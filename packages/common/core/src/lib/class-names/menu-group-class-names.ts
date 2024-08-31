import { getHostClassNames } from './class-names';
import { ThemeUIComponentProps, ThemeUIComponentsConfig, ThemeUIComponentsOptions } from '../model/ui-component.model';
import { validateUiComponentProps } from '../ui-component-props/ui-component-props';

export const menuGroupLayoutClassNamesConfig = {
  prefix: 'cck-menu-group',
  elements: {
    host: {
      name: 'Host Element',
      selectors: ['cck-menu-group'],
      description: 'It will add to the host element of MenuGroup component.',
    },
    disabled: {
      name: 'Host Element',
      selectors: ['cck-menu-group--disabled'],
      description: 'Applied to the host element of the MenuGroup component, when the the menu group is disabled',
    },
  },
};

export function getMenuGroupClassNames(
  componentProps: ThemeUIComponentProps,
  uiComponentsConfig: ThemeUIComponentsConfig
): Record<keyof typeof menuGroupLayoutClassNamesConfig.elements, string[]> {
  const options: ThemeUIComponentsOptions = {
    componentName: 'menuGroup',
    componentProps,
    uiComponentsConfig,
  };
  validateUiComponentProps(options);
  return {
    host: [
      ...menuGroupLayoutClassNamesConfig.elements.host.selectors,
      ...getHostClassNames(menuGroupLayoutClassNamesConfig.prefix, options),
    ],
    disabled: [...menuGroupLayoutClassNamesConfig.elements.disabled.selectors],
  };
}
