import { generateLayoutClassNameFromElement } from './class-names';
import { UIBaseComponentProps, ThemeConfig, LayoutClassNamesConfig } from '../model/theme-config.model';

export const overlayLayoutClassNamesConfig = {
  componentName: 'overlay',
  baseSelectorStructure: {
    block: 'overlay',
  },
  elements: {
    host: {
      name: 'Host Element',
      selectorStructure: [],
      description: 'Applied to the host element of the Overlay component.',
    },
    backdrop: {
      name: 'Backdrop Element',
      selectorStructure: [{ element: 'backdrop' }],
      description: 'Applied to the backdrop element of the Overlay component.',
    },
    contentWrapper: {
      name: 'Content Wrapper Element',
      selectorStructure: [{ element: 'content-wrapper' }],
      description: 'Applied to the wrapper element of the Overlay content.',
    },
  },
} satisfies LayoutClassNamesConfig;

export function getOverlayClassNames(
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof overlayLayoutClassNamesConfig.elements, string> {
  // DCK Components don't have props, so we don't need to validate them
  // validateUiBaseComponentProps(overlayLayoutClassNamesConfig.componentName, componentProps, themeConfig);

  return {
    host: generateLayoutClassNameFromElement(overlayLayoutClassNamesConfig, 'host', themeConfig, null),
    backdrop: generateLayoutClassNameFromElement(overlayLayoutClassNamesConfig, 'backdrop', themeConfig),
    contentWrapper: generateLayoutClassNameFromElement(overlayLayoutClassNamesConfig, 'contentWrapper', themeConfig),
  };
}
