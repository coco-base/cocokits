import { Canvas } from '@storybook/addon-docs';
import _ from 'lodash';
import React, { useContext } from 'react';
import styled from 'styled-components';

import { UIComponentsName } from '@cocokits/core';
import { useDocSelectedCckTheme } from '@cocokits/storybook-theme-switcher';

import { DocArgTypes } from './DocArgTypes';
import { DocCategory } from './DocCategory';
import { DocMarkdown } from './DocMarkdown';
import { DocSection } from './DocSection';
import { DocToc } from './DocToc';
import {
  filterStoryByScenario,
  filterStoryByThemeTag,
  getApiDescription,
  getThemeApiDescription,
  useArgTypesApiList,
  useArgTypesThemeApiList,
} from '../../utils/doc-page.utils';
import { DocsPageContext } from '../doc-page-container/DocPageContainer';


export function AutoDocMain() {

  const { title, metaDescription, category, primaryStory, stories } = useContext(DocsPageContext);
  const cckTheme = useDocSelectedCckTheme();

  if (!cckTheme) {
    return;
  }

  const componentName = _.camelCase(title) as UIComponentsName;
  const apiArgTypeList = useArgTypesApiList(componentName, primaryStory, cckTheme.uiComponentConfig);
  const themeApiArgTypeList = useArgTypesThemeApiList(componentName, cckTheme.uiComponentConfig);
  const API_SECTION = { id: `${primaryStory.componentId}--api`, name: 'API' };
  const THEME_API_SECTION = { id: `${primaryStory.componentId}--theme-api`, name: 'Theme API' };

  const tokItems = stories
    .filter(story => filterStoryByThemeTag(story, cckTheme.id))
    .map(story => ({
      id: story.id, name:
        story.name.replace(/^(theme|Theme) [^:]+: /, '') // Replace 'Theme XXX: AAA' to 'AAA'
    }));

  tokItems.push(API_SECTION);

  if (themeApiArgTypeList) {
    tokItems.push(THEME_API_SECTION);
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
        {stories
          .filter(story => filterStoryByThemeTag(story, cckTheme.id))
          .filter(story => filterStoryByScenario(story, cckTheme))
          .map((story) => {

            return (
              <DocSection
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
          <DocArgTypes argTypesList={apiArgTypeList.props} header='Props' />
          <DocArgTypes argTypesList={apiArgTypeList.events} header='Events' hideDefault={true} />
          <DocArgTypes argTypesList={apiArgTypeList.methods} header='methods' hideDefault={true}/>
        </DocSection>

        {
          themeApiArgTypeList &&
          themeApiArgTypeList.length > 0 &&
          <StyledSpacer />
        }

        {/* Theme API */}
        {
          themeApiArgTypeList && themeApiArgTypeList.length > 0 &&
          <DocSection
            id={THEME_API_SECTION.id} title={THEME_API_SECTION.name}
            description={getThemeApiDescription(cckTheme.name)}>
            <DocArgTypes argTypesList={themeApiArgTypeList} />
          </DocSection>
        }

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

const StyledSpacer = styled.div`
    height: 1px;
    margin-top: 48px;
`;
// endregion