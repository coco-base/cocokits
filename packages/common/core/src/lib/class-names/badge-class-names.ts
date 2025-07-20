import { generateLayoutClassNameFromElement } from './class-names';
import { LayoutClassNamesConfig, ThemeConfig, UIBaseComponentProps } from '../model/theme-config.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

export const badgeLayoutClassNamesConfig = {
  componentName: 'badge',
  baseSelectorStructure: { block: 'badge' },
  elements: {
    host: {
      name: 'Host Element',
      selectorStructure: [],
      description: 'It will add to the host element of `Badge` component.',
    },
    content: {
      name: 'Content Element',
      selectorStructure: [{ element: 'content' }],
      description: `It will add to the content element of \`Badge\` component.`,
    },
    maxIndicator: {
      name: 'Max Indicator Element',
      selectorStructure: [{ element: 'max-indicator' }],
      description: `The element that displays a \`+\` symbol when the content exceeds the maximum number`,
    },
    withContent: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'with-content' }],
      description: `Will be add to the host element, when the badge has content`,
    },
    withoutContent: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'without-content' }],
      description: `Will be add to the host element, when the badge has not content, and show as dot`,
    },
  },
} satisfies LayoutClassNamesConfig;

export function getBadgeClassNames(
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof badgeLayoutClassNamesConfig.elements, string> {
  validateUiBaseComponentProps(badgeLayoutClassNamesConfig.componentName, componentProps, themeConfig);

  return {
    host: generateLayoutClassNameFromElement(badgeLayoutClassNamesConfig, 'host', themeConfig, componentProps),
    withContent: generateLayoutClassNameFromElement(badgeLayoutClassNamesConfig, 'withContent', themeConfig),
    withoutContent: generateLayoutClassNameFromElement(badgeLayoutClassNamesConfig, 'withoutContent', themeConfig),
    content: generateLayoutClassNameFromElement(badgeLayoutClassNamesConfig, 'content', themeConfig),
    maxIndicator: generateLayoutClassNameFromElement(badgeLayoutClassNamesConfig, 'maxIndicator', themeConfig),
  };
}
