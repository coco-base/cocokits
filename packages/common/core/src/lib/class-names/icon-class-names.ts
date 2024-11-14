import { generateLayoutClassNameFromElement } from './class-names';
import { UIBaseComponentProps, ThemeConfig, LayoutClassNamesConfig } from '../model/theme-config.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

export const svgIconLayoutClassNamesConfig = {
  componentName: 'svgIcon',
  baseSelectorStructure: { block: 'svg-icon' },
  elements: {
    host: {
      name: 'Host Element',
      selectorStructure: [],
      description: `It will add to the host element of SvgIcon component and it's a wrapper of svg element`,
    },
    svg: {
      name: 'Svg Element',
      selectorStructure: [{ element: 'svg' }],
      description: `It will add to the svg element inside of SvgIcon component`,
    },
  },
} satisfies LayoutClassNamesConfig;

export function getSvgIconClassNames(
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof svgIconLayoutClassNamesConfig.elements, string> {
  validateUiBaseComponentProps(svgIconLayoutClassNamesConfig.componentName, componentProps, themeConfig);

  return {
    host: generateLayoutClassNameFromElement(svgIconLayoutClassNamesConfig, 'host', themeConfig, componentProps),
    svg: generateLayoutClassNameFromElement(svgIconLayoutClassNamesConfig, 'svg', themeConfig),
  };
}
