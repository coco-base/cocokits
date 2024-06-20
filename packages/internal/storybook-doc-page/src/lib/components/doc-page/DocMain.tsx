import React, { useContext } from 'react';
import styled from 'styled-components';

import { DocArgTypes } from './DocArgTypes';
import { DocMarkdown } from './DocMarkdown';
import { DocStory } from './DocStory';
import { DocToc } from './DocToc';
import { DocsPageContext } from '../doc-page-container/DocPageContainer';

export function DocMain() {

  const { title, metaDescription, category, primaryStory, storiesWithoutPrimary } = useContext(DocsPageContext);

  return (
    <StyledWrapper>
      <StyledMain>

        <div>
          <StyledCategory>{category}</StyledCategory>
          <h1>{title}</h1>
          <DocMarkdown>{metaDescription}</DocMarkdown>
        </div>

        <StyledDivider />

        <div>
          <DocStory story={primaryStory} expanded={true} />
          <DocArgTypes />
        </div>

        {storiesWithoutPrimary.length > 0 && <StyledDivider />}

        {storiesWithoutPrimary.map(story => <DocStory key={story.id} story={story} />)}

      </StyledMain>
      <DocToc/>
    </StyledWrapper>
  );
}

// region ---------------- STYLES ----------------
const StyledWrapper = styled.div`
    display: flex;
    position: relative;
    max-width: var(--cck-storybook-size-1280);
    margin: auto;
`;

const StyledMain = styled.main`
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: var(--cck-storybook-size-64) var(--cck-storybook-size-32) var(--cck-storybook-size-128) var(--cck-storybook-size-32);
    margin: 0 auto;
    z-index: 1;
    gap: var(--cck-storybook-size-48);
`;


const StyledCategory = styled.p`
    font: var(--cck-storybook-text-xs-medium);
    color: var(--cck-storybook-color-brand-default);
    margin-bottom: var(--cck-storybook-size-8);
`;

const StyledDivider = styled.div`
    height: var(--cck-storybook-size-1);
    background-color: var(--cck-storybook-color-border-alpha-default);
`;
// endregion