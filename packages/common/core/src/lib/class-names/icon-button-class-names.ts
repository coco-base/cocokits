import { getHostClassNames } from './class-names';
import { UIBaseComponentProps, ThemeConfig, CssSelectorGeneratorOptions } from '../model/theme-config.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

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
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof iconButtonLayoutClassNamesConfig.elements, string> {
  const options: CssSelectorGeneratorOptions = {
    componentName: 'iconButton',
    componentProps,
    themeConfig,
  };
  validateUiBaseComponentProps(options);
  return {
    host: [
      ...iconButtonLayoutClassNamesConfig.elements.host.selectors,
      ...getHostClassNames(iconButtonLayoutClassNamesConfig.prefix, options),
    ].join(' '),
    backdrop: [...iconButtonLayoutClassNamesConfig.elements.backdrop.selectors].join(' '),
  };
}
