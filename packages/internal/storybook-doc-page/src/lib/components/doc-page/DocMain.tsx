import { Canvas } from '@storybook/addon-docs';
import React, { useContext } from 'react';
import styled from 'styled-components';

import { useDocSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { DocArgTypes } from './DocArgTypes';
import { DocCategory } from './DocCategory';
import { DocMarkdown } from './DocMarkdown';
import { DocSection } from './DocSection';
import { DocToc } from './DocToc';
import { DocsPageContext } from '../doc-page-container/DocPageContainer';

const API_DESCRIPTION =
  'Please verify that the `FrameX` theme is also applied to your project to ensure consistency,' +
  'or change the theme of this document page to align with your project settings.' +
  'Mismatches between the theme of this document and your project can result in discrepancies in `type`' +
  'definitions and `default` values,' +
  'as themes may vary in their specifications.';


export function DocMain() {

  const { title, metaDescription, category, primaryStory, stories, ...rest } = useContext(DocsPageContext);
  const cckTheme = useDocSelectedCckTheme();

  const tokItems = stories.map(story => ({ id: story.id, name: story.name }));
  const API_SECTION = { id: `${primaryStory.componentId}--api`, name: 'API' };
  tokItems.push(API_SECTION);

  if (!cckTheme) {
    return;
  }


  return (
    <StyledWrapper>
      <StyledMain>

        {/* HEADER */}
        <div>
          <DocCategory>{category}</DocCategory>
          <h1>{title}</h1>
          <DocMarkdown>{metaDescription}</DocMarkdown>
        </div>

        <hr />

        {/* STORIES */}
        {stories.map(story => (
          <DocSection
            id={story.id}
            title={story.name}
            description={story.parameters['docs']?.description?.story}>
            <Canvas of={story.moduleExport} withToolbar={false} />
          </DocSection>
        ))}

        <hr />

        {/* API */}
        <DocSection id={API_SECTION.id} title={API_SECTION.name} description={API_DESCRIPTION}>
          <DocArgTypes uiComponentsConfig={cckTheme.uiComponentConfig} />
        </DocSection>

      </StyledMain>
      <DocToc items={tokItems} />
    </StyledWrapper>
  );
}

// region ---------------- STYLES ----------------
const StyledWrapper = styled.div`
    display: flex;
    position: relative;
    width: 100%;
    margin: auto;
`;

const StyledMain = styled.main`
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: var(--cck-storybook-size-64) var(--cck-storybook-size-32) var(--cck-storybook-size-128) var(--cck-storybook-size-32);
    margin: 0 auto;
    z-index: 1;
`;
// endregion