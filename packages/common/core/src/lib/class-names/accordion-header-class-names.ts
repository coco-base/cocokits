import { generateLayoutClassNameFromElement } from './class-names';
import { LayoutClassNamesConfig, ThemeConfig, UIBaseComponentProps } from '../model/theme-config.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

export const accordionHeaderLayoutClassNamesConfig = {
  componentName: 'accordionHeader',
  baseSelectorStructure: { block: 'accordion-header' },
  elements: {
    host: {
      name: 'Host Element',
      selectorStructure: [],
      description: 'It will add to the host element of `AccordionHeader` component.',
    },
    iconBtn: {
      name: 'Icon Button Element',
      selectorStructure: [{ element: 'icon-btn' }],
      description: `The Icon button element that contains icon of header`,
    },
    iconLeft: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'icon-left' }],
      description: `Will be add to the host element, when the icon is at left of header element`,
    },
    iconRight: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'icon-right' }],
      description: `Will be add to the host element, when the icon is at right of header element`,
    },
    triggerIcon: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'trigger-icon' }],
      description: `Will be add to the host element, when the icon is used as trigger for expanding/collapsing the panel`,
    },
    triggerHeader: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'trigger-header' }],
      description: `Will be add to the host element, when the header is used as trigger for expanding/collapsing the panel`,
    },
  },
} satisfies LayoutClassNamesConfig;

export function getAccordionHeaderClassNames(
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof accordionHeaderLayoutClassNamesConfig.elements, string> {
  validateUiBaseComponentProps(accordionHeaderLayoutClassNamesConfig.componentName, componentProps, themeConfig);

  return {
    host: generateLayoutClassNameFromElement(
      accordionHeaderLayoutClassNamesConfig,
      'host',
      themeConfig,
      componentProps
    ),
    iconBtn: generateLayoutClassNameFromElement(accordionHeaderLayoutClassNamesConfig, 'iconBtn', themeConfig),
    iconLeft: generateLayoutClassNameFromElement(accordionHeaderLayoutClassNamesConfig, 'iconLeft', themeConfig),
    iconRight: generateLayoutClassNameFromElement(accordionHeaderLayoutClassNamesConfig, 'iconRight', themeConfig),
    triggerIcon: generateLayoutClassNameFromElement(accordionHeaderLayoutClassNamesConfig, 'triggerIcon', themeConfig),
    triggerHeader: generateLayoutClassNameFromElement(
      accordionHeaderLayoutClassNamesConfig,
      'triggerHeader',
      themeConfig
    ),
  };
}
