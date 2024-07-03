import { cssSelectorRender } from './css-selector-render';
import { ThemeUIComponentProps, ThemeUIComponentsConfig, ThemeUIComponentsOptions } from '../model/ui-component.model';
import { getComponentPropsWithDefault, validateUiComponentProps } from '../ui-component-props/ui-component-props';

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
) {
  const options: ThemeUIComponentsOptions = {
    componentName: 'svgIcon',
    componentProps,
    uiComponentsConfig,
  };
  validateUiComponentProps(options);
  const { type, color, size } = getComponentPropsWithDefault(options);

  const classNames = {
    host: [...svgIconLayoutClassNamesConfig.elements.host.selectors],
    svg: [...svgIconLayoutClassNamesConfig.elements.svg.selectors],
  };

  if (type) {
    classNames.host.push(cssSelectorRender.type(svgIconLayoutClassNamesConfig.prefix, type));
  }

  if (color) {
    classNames.host.push(cssSelectorRender.color(svgIconLayoutClassNamesConfig.prefix, color));
  }

  if (size) {
    classNames.host.push(cssSelectorRender.size(svgIconLayoutClassNamesConfig.prefix, size));
  }

  return classNames;
}
