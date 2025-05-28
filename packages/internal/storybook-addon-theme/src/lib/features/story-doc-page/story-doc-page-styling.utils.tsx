import {
  cssSelectorRender,
  generateLayoutBaseClassName,
  LayoutClassNamesConfig,
  ThemeComponentConfig,
  ThemeConfig,
} from '@cocokits/core';

import { StoryDocPageStylingTableVariants } from './story-doc-page-styling.model';

/**
 * NOTE: The selector generator for this part is duplicated in 'packages\common\core\src\lib\class-names\class-names.ts'
 * Each changes must be also added to the other file
 */
export function getElementsVariants(
  layoutClassNamesConfig: LayoutClassNamesConfig,
  themeConfig: ThemeConfig
): StoryDocPageStylingTableVariants[] {
  return Object.entries(layoutClassNamesConfig.elements).map(([key, value]) => ({
    description: value.description,
    elementName: value.name,
    cssSelector: generateLayoutBaseClassName(
      layoutClassNamesConfig,
      key as keyof typeof layoutClassNamesConfig.elements,
      themeConfig
    ).join(' '),
  }));
}

/**
 * NOTE: The selector generator for this part is duplicated in 'packages\common\core\src\lib\class-names\class-names.ts'
 * Each changes must be also added to the other file
 */
export function getTypeVariants(
  themeComponentConfig: ThemeComponentConfig | undefined,
  blockSelector: string,
  themeConfig: ThemeConfig
): StoryDocPageStylingTableVariants[] {
  if (!themeComponentConfig?.type) {
    return [];
  }

  const variants = [
    {
      description: `Applied when no type is defined within the component, defaulting to the selected theme's type.`,
      elementName: 'Host Element',
      cssSelector: cssSelectorRender({
        block: blockSelector,
        modifier: 'default-type',
        themePrefix: themeConfig.cssSelectorPrefix,
      }),
    },
  ];

  themeComponentConfig.type.values.forEach((type) => {
    variants.push({
      description: `This selector is appended to the host element when the type of the component is '${type}'`,
      elementName: 'Host Element',
      cssSelector: cssSelectorRender({
        block: blockSelector,
        element: type,
        themePrefix: themeConfig.cssSelectorPrefix,
      }),
    });
  });

  return variants;
}

/**
 * NOTE: The selector generator for this part is duplicated in 'packages\common\core\src\lib\class-names\class-names.ts'
 * Each changes must be also added to the other file
 */
export function getColorVariants(
  themeComponentConfig: ThemeComponentConfig | undefined,
  blockSelector: string,
  themeConfig: ThemeConfig
): StoryDocPageStylingTableVariants[] {
  if (!themeComponentConfig?.color) {
    return [];
  }

  const variants = [
    {
      description: `Applied when no color is defined within the component, defaulting to the selected theme's color.`,
      elementName: 'Host Element',
      cssSelector: cssSelectorRender({
        block: blockSelector,
        modifier: 'default-color',
        themePrefix: themeConfig.cssSelectorPrefix,
      }),
    },
  ];

  themeComponentConfig.color.values.forEach((color) => {
    variants.push({
      description: `This selector is appended to the host element when the color of the component is '${color}'`,
      elementName: 'Host Element',
      cssSelector: cssSelectorRender({
        block: blockSelector,
        element: 'color',
        modifier: color,
        themePrefix: themeConfig.cssSelectorPrefix,
      }),
    });
  });

  return variants;
}

/**
 * NOTE: The selector generator for this part is duplicated in 'packages\common\core\src\lib\class-names\class-names.ts'
 * Each changes must be also added to the other file
 */
export function getSizeVariants(
  themeComponentConfig: ThemeComponentConfig | undefined,
  blockSelector: string,
  themeConfig: ThemeConfig
): StoryDocPageStylingTableVariants[] {
  if (!themeComponentConfig?.size) {
    return [];
  }

  const variants = [
    {
      description: `Applied when no size is defined within the component, defaulting to the selected theme's size.`,
      elementName: 'Host Element',
      cssSelector: cssSelectorRender({
        block: blockSelector,
        modifier: 'default-size',
        themePrefix: themeConfig.cssSelectorPrefix,
      }),
    },
  ];

  themeComponentConfig.size.values.forEach((size) => {
    variants.push({
      description: `This selector is appended to the host element when the size of the component is '${size}'`,
      elementName: 'Host Element',
      cssSelector: cssSelectorRender({
        block: blockSelector,
        element: 'size',
        modifier: size,
        themePrefix: themeConfig.cssSelectorPrefix,
      }),
    });
  });

  return variants;
}
