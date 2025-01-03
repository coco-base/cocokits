import { generateLayoutClassNameFromElement } from './class-names';
import { LayoutClassNamesConfig, ThemeConfig, UIBaseComponentProps } from '../model/theme-config.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

export const selectPreviewLayoutClassNamesConfig = {
  componentName: 'selectPreview',
  baseSelectorStructure: {
    block: 'select-preview',
  },
  elements: {
    host: {
      name: 'Host Element',
      selectorStructure: [],
      description: 'It will add to the host element of SelectPreview component.',
    },
  },
} satisfies LayoutClassNamesConfig;

export function getSelectPreviewClassNames(
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof selectPreviewLayoutClassNamesConfig.elements, string> {
  validateUiBaseComponentProps(selectPreviewLayoutClassNamesConfig.componentName, componentProps, themeConfig);

  return {
    host: generateLayoutClassNameFromElement(selectPreviewLayoutClassNamesConfig, 'host', themeConfig, componentProps),
  };
}
