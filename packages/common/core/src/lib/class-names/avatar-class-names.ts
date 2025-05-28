import { generateLayoutClassNameFromElement } from './class-names';
import { LayoutClassNamesConfig, ThemeConfig, UIBaseComponentProps } from '../model/theme-config.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

export const avatarLayoutClassNamesConfig = {
  componentName: 'avatar',
  baseSelectorStructure: { block: 'avatar' },
  elements: {
    host: {
      name: 'Host Element',
      selectorStructure: [],
      description: 'It will add to the host element of `Avatar` component.',
    },
    image: {
      name: 'Main image element',
      selectorStructure: [{ element: 'image' }],
      description: `It's the main image of avatar`,
    },
    placeholderImage: {
      name: 'Placeholder Image element',
      selectorStructure: [{ element: 'placeholder-image' }],
      description: `It's a placeholder image of main image and will visible during loading the main image`,
    },
    fallbackImage: {
      name: 'Fallback image element',
      selectorStructure: [{ element: 'fallback-image' }],
      description: `It's a fallback image of main image and will visible during loading the main image`,
    },
    label: {
      name: 'Label element',
      selectorStructure: [{ element: 'label' }],
      description: `It's an html element to show the label of user instead of image`,
    },
    loading: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'loading' }],
      description: `Will be add to the host element, when the component use image and the image is in loading state`,
    },
    loaded: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'loaded' }],
      description: `Will be add to the host element, when the component use image and the image is loaded`,
    },
    fallback: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'fallback' }],
      description: `Will be add to the host element, when the component use image and the image is failed to load`,
    },
    withImage: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'with-image' }],
      description: `Will be add to the host element, when the component use image `,
    },
    withLabel: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'with-label' }],
      description: `Will be add to the host element, when the component use label`,
    },
    withCustomContent: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'with-custom-content' }],
      description: `Will be add to the host element, when the component has custom template`,
    },
    clickable: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'clickable' }],
      description: `Will be add to the host element, when the component is clickable`,
    },
  },
} satisfies LayoutClassNamesConfig;

export function getAvatarClassNames(
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof avatarLayoutClassNamesConfig.elements, string> {
  validateUiBaseComponentProps(avatarLayoutClassNamesConfig.componentName, componentProps, themeConfig);

  return {
    host: generateLayoutClassNameFromElement(avatarLayoutClassNamesConfig, 'host', themeConfig, componentProps),
    image: generateLayoutClassNameFromElement(avatarLayoutClassNamesConfig, 'image', themeConfig),
    placeholderImage: generateLayoutClassNameFromElement(avatarLayoutClassNamesConfig, 'placeholderImage', themeConfig),
    fallbackImage: generateLayoutClassNameFromElement(avatarLayoutClassNamesConfig, 'fallbackImage', themeConfig),
    label: generateLayoutClassNameFromElement(avatarLayoutClassNamesConfig, 'label', themeConfig),
    loading: generateLayoutClassNameFromElement(avatarLayoutClassNamesConfig, 'loading', themeConfig),
    loaded: generateLayoutClassNameFromElement(avatarLayoutClassNamesConfig, 'loaded', themeConfig),
    fallback: generateLayoutClassNameFromElement(avatarLayoutClassNamesConfig, 'fallback', themeConfig),
    withImage: generateLayoutClassNameFromElement(avatarLayoutClassNamesConfig, 'withImage', themeConfig),
    withLabel: generateLayoutClassNameFromElement(avatarLayoutClassNamesConfig, 'withLabel', themeConfig),
    withCustomContent: generateLayoutClassNameFromElement(
      avatarLayoutClassNamesConfig,
      'withCustomContent',
      themeConfig
    ),
    clickable: generateLayoutClassNameFromElement(avatarLayoutClassNamesConfig, 'clickable', themeConfig),
  };
}
