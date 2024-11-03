import { getHostClassNames } from './class-names';
import { ThemeUIComponentProps, ThemeUIComponentsConfig, ThemeUIComponentsOptions } from '../model/ui-component.model';
import { validateUiComponentProps } from '../ui-component-props/ui-component-props';

export const svgIconLayoutClassNamesConfig = {
  prefix: 'cck-svg-icon',
  elements: {
    host: {
      name: 'Host Element',
      selectors: ['cck-svg-icon'],
      description: `It will add to the host element of SvgIcon component and it's a wrapper of svg element`,
    },
    svg: {
      name: 'Svg Element',
      selectors: ['cck-svg-icon__svg'],
      description: `It will add to the svg element inside of SvgIcon component`,
    },
  },
};

export function getSvgIconClassNames(
  componentProps: ThemeUIComponentProps,
  uiComponentsConfig: ThemeUIComponentsConfig
): Record<keyof typeof svgIconLayoutClassNamesConfig.elements, string> {
  const options: ThemeUIComponentsOptions = {
    componentName: 'svgIcon',
    componentProps,
    uiComponentsConfig,
  };
  validateUiComponentProps(options);

  return {
    host: [
      ...svgIconLayoutClassNamesConfig.elements.host.selectors,
      ...getHostClassNames(svgIconLayoutClassNamesConfig.prefix, options),
    ].join(' '),
    svg: [...svgIconLayoutClassNamesConfig.elements.svg.selectors].join(' '),
  };
}
