import { useMemo } from 'react';

import { safeMergeString } from '@cocokits/common-utils';
import { LayoutClassNamesConfig, layoutClassNamesConfigRecord, UIBaseComponentsName } from '@cocokits/core';

import {
  getColorVariants,
  getElementsVariants,
  getSizeVariants,
  getTypeVariants,
} from './story-doc-page-styling.utils';
import { StoryDocPageStylingTable } from './story-doc-page-styling-table';
import { useTheme } from '../../utils/use-preview-theme';
import { DocPageSection } from '../doc-page/doc-page-section';

interface StoryDocPageStylingTableVariants {
  componentName: string;
  uiBaseComponentName: UIBaseComponentsName;
}

export function StoryDocPageStylingSection({ uiBaseComponentName, componentName }: StoryDocPageStylingTableVariants) {
  const { dispatchTheme, ...theme } = useTheme();

  const layoutClassNamesConfig: LayoutClassNamesConfig = layoutClassNamesConfigRecord[uiBaseComponentName];
  const themeComponentConfig = theme.themeConfig.components[uiBaseComponentName];

  const { elementsVariants, typeVariants, colorVariants, sizeVariants } = useMemo(() => {
    const blockSelector = safeMergeString(
      layoutClassNamesConfig.baseSelectorStructure.block,
      ...layoutClassNamesConfig.elements.host.selectorStructure.map((s) => s.block)
    );

    return {
      elementsVariants: getElementsVariants(layoutClassNamesConfig, theme.themeConfig),
      typeVariants: getTypeVariants(themeComponentConfig, blockSelector, theme.themeConfig),
      colorVariants: getColorVariants(themeComponentConfig, blockSelector, theme.themeConfig),
      sizeVariants: getSizeVariants(themeComponentConfig, blockSelector, theme.themeConfig),
    };
  }, [theme.themeConfig]);

  const hasVariants = typeVariants.length > 0 || colorVariants.length > 0 || sizeVariants.length > 0;

  return (
    <>
      <DocPageSection id={componentName} title={componentName}>
        <h3>Layout Elements</h3>
        <p>Selectors in this group will always be added to the DOM element, regardless of the variant.</p>
        <StoryDocPageStylingTable tableProps={elementsVariants} />

        {hasVariants && (
          <>
            <h3>Variants</h3>
            <p>
              These selectors will be added to the DOM when the corresponding variant group is added to the component.
            </p>

            {typeVariants.length > 0 && (
              <>
                <h4>Type</h4>
                <StoryDocPageStylingTable tableProps={typeVariants} />
              </>
            )}

            {colorVariants.length > 0 && (
              <>
                <h4>Color</h4>
                <StoryDocPageStylingTable tableProps={colorVariants} />
              </>
            )}

            {sizeVariants.length > 0 && (
              <>
                <h4>Size</h4>
                <StoryDocPageStylingTable tableProps={sizeVariants} />
              </>
            )}
          </>
        )}
      </DocPageSection>
    </>
  );
}
