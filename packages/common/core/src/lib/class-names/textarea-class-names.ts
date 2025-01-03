import { generateLayoutClassNameFromElement } from './class-names';
import { LayoutClassNamesConfig, ThemeConfig, UIBaseComponentProps } from '../model/theme-config.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

export const textareaClassNamesConfig = {
  componentName: 'textarea',
  baseSelectorStructure: {
    block: 'textarea',
  },
  elements: {
    host: {
      name: 'Host Element',
      selectorStructure: [],
      description: 'It will add to the host element of textarea component.',
    },
    disabled: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'disabled' }],
      description: 'It will add to the host element of textarea component, the component is disabled',
    },
    autoResize: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'auto-resize' }],
      description:
        'It will add to the host element of textarea component, the height of textarea will automatically change based on content',
    },
  },
} satisfies LayoutClassNamesConfig;

export function getTextareaClassNames(
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof textareaClassNamesConfig.elements, string> {
  validateUiBaseComponentProps(textareaClassNamesConfig.componentName, componentProps, themeConfig);

  return {
    host: generateLayoutClassNameFromElement(textareaClassNamesConfig, 'host', themeConfig, componentProps),
    disabled: generateLayoutClassNameFromElement(textareaClassNamesConfig, 'disabled', themeConfig),
    autoResize: generateLayoutClassNameFromElement(textareaClassNamesConfig, 'autoResize', themeConfig),
  };
}
