import { generateLayoutClassNameFromElement } from './class-names';
import { LayoutClassNamesConfig, ThemeConfig, UIBaseComponentProps } from '../model/theme-config.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

export const accordionLayoutClassNamesConfig = {
  componentName: 'accordion',
  baseSelectorStructure: { block: 'accordion' },
  elements: {
    host: {
      name: 'Host Element',
      selectorStructure: [],
      description: 'It will add to the host element of `Accordion` component.',
    },
    instantAnimation: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'instant-animation' }],
      description: `Will be add to the host element, when the collapsing and expanding should not have any animation`,
    },
    singleMode: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'single-mode' }],
      description: `Will be add to the host element, when accordion can expand only one panel`,
    },
    multiMode: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'multi-mode' }],
      description: `Will be add to the host element, when accordion can expand multiple panels`,
    },
  },
} satisfies LayoutClassNamesConfig;

export function getAccordionClassNames(
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof accordionLayoutClassNamesConfig.elements, string> {
  validateUiBaseComponentProps(accordionLayoutClassNamesConfig.componentName, componentProps, themeConfig);

  return {
    host: generateLayoutClassNameFromElement(accordionLayoutClassNamesConfig, 'host', themeConfig, componentProps),
    instantAnimation: generateLayoutClassNameFromElement(
      accordionLayoutClassNamesConfig,
      'instantAnimation',
      themeConfig
    ),
    singleMode: generateLayoutClassNameFromElement(accordionLayoutClassNamesConfig, 'singleMode', themeConfig),
    multiMode: generateLayoutClassNameFromElement(accordionLayoutClassNamesConfig, 'multiMode', themeConfig),
  };
}
