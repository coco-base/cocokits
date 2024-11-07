import { getHostClassNames } from './class-names';
import { UIBaseComponentProps, CssSelectorGeneratorOptions, ThemeConfig } from '../model/ui-component.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

export const buttonLayoutClassNamesConfig = {
  prefix: 'cck-button',
  elements: {
    host: {
      name: 'Host Element',
      selectors: ['cck-button'],
      description: 'It will add to the host element of Button component. The default style has `relative` position.',
    },
    backdrop: {
      name: 'Backdrop Element',
      selectors: ['cck-button__backdrop'],
      description:
        'It is an empty `div` added to the host element to add more style base on the design system concepts. (Fro example the Ripple effect). The default styles are full size `absolute` position and `display: none`',
    },
  },
};

export function getButtonClassNames(
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof buttonLayoutClassNamesConfig.elements, string> {
  const options: CssSelectorGeneratorOptions = {
    componentName: 'button',
    componentProps,
    themeConfig,
  };
  validateUiBaseComponentProps(options);
  return {
    host: [
      ...buttonLayoutClassNamesConfig.elements.host.selectors,
      ...getHostClassNames(buttonLayoutClassNamesConfig.prefix, options),
    ].join(' '),
    backdrop: [...buttonLayoutClassNamesConfig.elements.backdrop.selectors].join(' '),
  };
}
