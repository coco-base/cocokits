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
    // example: {
    //   name: '...',
    //   selectorStructure: [{ element: '...', modifier: '...' }],
    //   description: `...`,
    // },
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
    // example: generateLayoutClassNameFromElement(accordionHeaderLayoutClassNamesConfig, 'example', themeConfig),
  };
}
