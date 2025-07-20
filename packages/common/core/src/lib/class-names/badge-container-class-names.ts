import { generateLayoutClassNameFromElement } from './class-names';
import { LayoutClassNamesConfig, ThemeConfig, UIBaseComponentProps } from '../model/theme-config.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

export const badgeContainerLayoutClassNamesConfig = {
  componentName: 'badgeContainer',
  baseSelectorStructure: { block: 'badge-container' },
  elements: {
    host: {
      name: 'Host Element',
      selectorStructure: [],
      description: 'It will add to the host element of `BadgeContainer` component.',
    },
    topLeft: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'top-left' }],
      description: `Will be add to the host element, when the position is top-left`,
    },
    topRight: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'top-right' }],
      description: `Will be add to the host element, when the position is top-right`,
    },
    bottomLeft: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'bottom-left' }],
      description: `Will be add to the host element, when the position is bottom-left`,
    },
    bottomRight: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'bottom-right' }],
      description: `Will be add to the host element, when the position is bottom-right`,
    },
    customOffset: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'custom-offset' }],
      description: `Will be add to the host element, when the custom offset exists`,
    },
  },
} satisfies LayoutClassNamesConfig;

export function getBadgeContainerClassNames(
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof badgeContainerLayoutClassNamesConfig.elements, string> {
  validateUiBaseComponentProps(badgeContainerLayoutClassNamesConfig.componentName, componentProps, themeConfig);

  return {
    host: generateLayoutClassNameFromElement(badgeContainerLayoutClassNamesConfig, 'host', themeConfig, componentProps),
    topLeft: generateLayoutClassNameFromElement(badgeContainerLayoutClassNamesConfig, 'topLeft', themeConfig),
    topRight: generateLayoutClassNameFromElement(badgeContainerLayoutClassNamesConfig, 'topRight', themeConfig),
    bottomLeft: generateLayoutClassNameFromElement(badgeContainerLayoutClassNamesConfig, 'bottomLeft', themeConfig),
    bottomRight: generateLayoutClassNameFromElement(badgeContainerLayoutClassNamesConfig, 'bottomRight', themeConfig),
    customOffset: generateLayoutClassNameFromElement(badgeContainerLayoutClassNamesConfig, 'customOffset', themeConfig),
  };
}
