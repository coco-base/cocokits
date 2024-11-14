import { generateLayoutClassNameFromElement } from './class-names';
import { UIBaseComponentProps, ThemeConfig, LayoutClassNamesConfig } from '../model/theme-config.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

export const labelLayoutClassNamesConfig = {
  componentName: 'label',
  baseSelectorStructure: {
    block: 'label',
  },
  elements: {
    host: {
      name: 'Host Element',
      selectorStructure: [],
      description: 'It will add to the host element of Label component.',
    },
    labelTag: {
      name: 'Label Element',
      selectorStructure: [{ element: 'label-tag' }],
      description: 'It will add to the `label` element of html tag',
    },
    requiredMarker: {
      name: 'Required Marker Element',
      selectorStructure: [{ element: 'required-marker' }],
      description:
        'It will add to the required marker element, when the `hideRequiredMarker` of `FormField` component is `false`. It will show the `*` at end of label text',
    },
  },
} satisfies LayoutClassNamesConfig;

export function getLabelClassNames(
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof labelLayoutClassNamesConfig.elements, string> {
  validateUiBaseComponentProps(labelLayoutClassNamesConfig.componentName, componentProps, themeConfig);

  return {
    host: generateLayoutClassNameFromElement(labelLayoutClassNamesConfig, 'host', themeConfig, componentProps),
    labelTag: generateLayoutClassNameFromElement(labelLayoutClassNamesConfig, 'labelTag', themeConfig),
    requiredMarker: generateLayoutClassNameFromElement(labelLayoutClassNamesConfig, 'requiredMarker', themeConfig),
  };
}
