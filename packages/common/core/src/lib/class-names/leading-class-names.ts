import { generateLayoutClassNameFromElement } from './class-names';
import { UIBaseComponentProps, ThemeConfig, LayoutClassNamesConfig } from '../model/theme-config.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

export const leadingLayoutClassNamesConfig = {
  componentName: 'leading',
  baseSelectorStructure: {
    block: 'leading',
  },
  elements: {
    host: {
      name: 'Host Element',
      selectorStructure: [],
      description: 'It will add to the host element of Hint component.',
    },
    clickable: {
      name: 'Clickable Host Element',
      selectorStructure: [{ modifier: 'clickable' }],
      description: 'It will add to the host element of Leading component, when the element is clickable',
    },
  },
} satisfies LayoutClassNamesConfig;

export function getLeadingClassNames(
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof leadingLayoutClassNamesConfig.elements, string> {
  validateUiBaseComponentProps(leadingLayoutClassNamesConfig.componentName, componentProps, themeConfig);

  return {
    host: generateLayoutClassNameFromElement(leadingLayoutClassNamesConfig, 'host', themeConfig, componentProps),
    clickable: generateLayoutClassNameFromElement(leadingLayoutClassNamesConfig, 'clickable', themeConfig),
  };
}
