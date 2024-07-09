import { getHostClassNames } from './class-names';
import { ThemeUIComponentProps, ThemeUIComponentsConfig, ThemeUIComponentsOptions } from '../model/ui-component.model';
import { validateUiComponentProps } from '../ui-component-props/ui-component-props';

export const iconButtonLayoutClassNamesConfig = {
  prefix: 'cck-icon-button',
  elements: {
    host: {
      name: 'Host Element',
      selectors: ['cck-icon-button'],
      description:
        'It will add to the host element of IconButton component. The default style has `relative` position.',
    },
    backdrop: {
      name: 'Backdrop Element',
      selectors: ['cck-icon-button__backdrop'],
      description:
        'It is an empty `div` added to the host element to add more style base on the design system concepts. (Fro example the Ripple effect). The default styles are full size `absolute` position and `display: none`',
    },
  },
};

export function getIconButtonClassNames(
  componentProps: ThemeUIComponentProps,
  uiComponentsConfig: ThemeUIComponentsConfig
) {
  const options: ThemeUIComponentsOptions = {
    componentName: 'iconButton',
    componentProps,
    uiComponentsConfig,
  };
  validateUiComponentProps(options);
  return {
    host: [
      ...iconButtonLayoutClassNamesConfig.elements.host.selectors,
      ...getHostClassNames(iconButtonLayoutClassNamesConfig.prefix, options),
    ],
    backdrop: [...iconButtonLayoutClassNamesConfig.elements.backdrop.selectors],
  };
}
