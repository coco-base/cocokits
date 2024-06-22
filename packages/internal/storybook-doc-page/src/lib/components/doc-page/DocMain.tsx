import React, { useContext } from 'react';
import styled from 'styled-components';

import { DocArgTypes } from './DocArgTypes';
import { DocMarkdown } from './DocMarkdown';
import { DocStory } from './DocStory';
import { DocToc } from './DocToc';
import { DocsPageContext } from '../doc-page-container/DocPageContainer';
import { DocCategory } from './DocCategory';


export function DocMain() {

  const { title, metaDescription, category, primaryStory, storiesWithoutPrimary } = useContext(DocsPageContext);

  return (
    <StyledWrapper>
      <StyledMain>

        <div>
          <DocCategory>{category}</DocCategory>
          <h1>{title}</h1>
          <DocMarkdown>{metaDescription}</DocMarkdown>
        </div>

        <hr/>

        <div>
          <DocStory story={primaryStory} expanded={true} />
          <DocArgTypes />
        </div>

        {storiesWithoutPrimary.length > 0 && <hr />}

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
    width: 100%;
    margin: auto;
    overflow: hidden;
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