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
    // example: {
    //   name: '...',
    //   selectorStructure: [{ element: '...', modifier: '...' }],
    //   description: `...`,
    // },
  },
} satisfies LayoutClassNamesConfig;

export function getAccordionClassNames(
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof accordionLayoutClassNamesConfig.elements, string> {
  validateUiBaseComponentProps(accordionLayoutClassNamesConfig.componentName, componentProps, themeConfig);

  return {
    host: generateLayoutClassNameFromElement(accordionLayoutClassNamesConfig, 'host', themeConfig, componentProps),
    // example: generateLayoutClassNameFromElement(accordionLayoutClassNamesConfig, 'example', themeConfig),
  };
}
