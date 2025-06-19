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
    contentWrapper: {
      name: 'Content Wrapper Element',
      selectorStructure: [{ element: 'content-wrapper' }],
      description: `The Wrapper element that contains content of panel`,
    },
    // withLazyLoad: {
    //   name: 'Host Element',
    //   selectorStructure: [{ modifier: 'with-lazy-load' }],
    //   description: `Will be add to the host element, when the lazy loading template is available`,
    // },
    disabled: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'disabled' }],
      description: `Will be add to the host element, when the panel is disabled`,
    },
    expanded: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'expanded' }],
      description: `Will be add to the host element, when the panel is expanded`,
    },
    collapsed: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'collapsed' }],
      description: `Will be add to the host element, when the panel is collapsed`,
    },
  },
} satisfies LayoutClassNamesConfig;

export function getAccordionPanelClassNames(
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof accordionPanelLayoutClassNamesConfig.elements, string> {
  validateUiBaseComponentProps(accordionPanelLayoutClassNamesConfig.componentName, componentProps, themeConfig);

  return {
    host: generateLayoutClassNameFromElement(accordionPanelLayoutClassNamesConfig, 'host', themeConfig, componentProps),
    contentWrapper: generateLayoutClassNameFromElement(
      accordionPanelLayoutClassNamesConfig,
      'contentWrapper',
      themeConfig
    ),
    // withLazyLoad: generateLayoutClassNameFromElement(accordionPanelLayoutClassNamesConfig, 'withLazyLoad', themeConfig),
    disabled: generateLayoutClassNameFromElement(accordionPanelLayoutClassNamesConfig, 'disabled', themeConfig),
    expanded: generateLayoutClassNameFromElement(accordionPanelLayoutClassNamesConfig, 'expanded', themeConfig),
    collapsed: generateLayoutClassNameFromElement(accordionPanelLayoutClassNamesConfig, 'collapsed', themeConfig),
  };
}
