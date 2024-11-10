import { Canvas } from '@storybook/addon-docs';
import  { useContext } from 'react';
import styled from 'styled-components';

import { useDocSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { DocArgTypes } from './DocArgTypes';
import { DocCategory } from './DocCategory';
import { DocMarkdown } from './DocMarkdown';
import { DocSection } from './DocSection';
import { DocToc } from './DocToc';
import { filterStoryByScenario, filterStoryByThemeTag, getApiDescription } from '../../utils/doc-page.utils';
import { DocsPageContext } from '../doc-page-container/DocPageContainer';


export function AutoDocMain() {

  const { title, metaDescription, category, primaryStory, stories } = useContext(DocsPageContext);
  const cckTheme = useDocSelectedCckTheme();

  if (!cckTheme) {
    return;
  }

  const tokItems = stories
    .filter(story => filterStoryByThemeTag(story, cckTheme.id))
    .map(story => ({
      id: story.id, name:
        story.name.replace(/^(theme|Theme) [^:]+: /, '') // Replace 'Theme XXX: AAA' to 'AAA'
    }));

  const API_SECTION = { id: `${primaryStory.componentId}--api`, name: 'API' };
  tokItems.push(API_SECTION);


  return (
    <StyledWrapper>
      <StyledMain>

        {/* HEADER */}
        <div>
          <DocCategory>{category}</DocCategory>
          <h1>{title}</h1>
          <DocMarkdown>{metaDescription}</DocMarkdown>
        </div>

        {/* STORIES */}
        {stories
          .filter(story => filterStoryByThemeTag(story, cckTheme.id))
          .filter(story => filterStoryByScenario(story, cckTheme))
          .map((story) => {

            return (
              <DocSection
                key={story.id}
                id={story.id}
                title={story.name}
                description={story.parameters['docs']?.description?.story}>
                <Canvas of={story.moduleExport} withToolbar={false} />
              </DocSection>
            );

          })
        }

        <hr />

        {/* API */}
        <DocSection id={API_SECTION.id} title={API_SECTION.name} description={getApiDescription(cckTheme.name)}>
          <DocArgTypes cckTheme={cckTheme}/>
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
    min-width: 0;
`;

// endregion