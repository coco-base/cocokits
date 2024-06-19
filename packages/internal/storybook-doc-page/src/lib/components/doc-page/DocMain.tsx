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
    max-width: var(--size-30);
    margin: auto;
`;

const StyledMain = styled.main`
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: var(--size-14) var(--size-11) var(--size-18) var(--size-11);
    margin: 0 auto;
    z-index: 1;
    gap: var(--size-13);
`;


const StyledCategory = styled.p`
    font: var(--text-xs-medium);
    color: var(--color-brand-default);
    margin-bottom: var(--size-5);
`;

const StyledDivider = styled.div`
    height: var(--size-1);
    background-color: var(--color-border-alpha-default);
`;
// endregion