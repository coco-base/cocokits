import { generateLayoutClassNameFromElement } from './class-names';
import { LayoutClassNamesConfig, ThemeConfig, UIBaseComponentProps } from '../model/theme-config.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

export const accordionPanelLayoutClassNamesConfig = {
  componentName: 'accordionPanel',
  baseSelectorStructure: { block: 'accordion-panel' },
  elements: {
    host: {
      name: 'Host Element',
      selectorStructure: [],
      description: 'It will add to the host element of `AccordionPanel` component.',
    },
    // example: {
    //   name: '...',
    //   selectorStructure: [{ element: '...', modifier: '...' }],
    //   description: `...`,
    // },
  },
} satisfies LayoutClassNamesConfig;

export function getAccordionPanelClassNames(
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof accordionPanelLayoutClassNamesConfig.elements, string> {
  validateUiBaseComponentProps(accordionPanelLayoutClassNamesConfig.componentName, componentProps, themeConfig);

  return {
    host: generateLayoutClassNameFromElement(accordionPanelLayoutClassNamesConfig, 'host', themeConfig, componentProps),
    // example: generateLayoutClassNameFromElement(accordionPanelLayoutClassNamesConfig, 'example', themeConfig),
  };
}
