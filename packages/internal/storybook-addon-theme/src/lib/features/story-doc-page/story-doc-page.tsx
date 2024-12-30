import { DocsContext, useOf } from '@storybook/blocks';
import { useContext, useMemo, useState } from 'react';
import styled from 'styled-components';

import { Tab, Tabs, TabSelectionChangeEvent } from '@cocokits/react-tabs';

import { getApiProps, getOverviewProps, getStylingProps } from './story-doc-page.utils';
import { StoryDocPageAPI } from './story-doc-page-api';
import { StoryDocPageExamples } from './story-doc-page-examples';
import { StoryDocPageOverview } from './story-doc-page-overview';
import { StoryDocPageStyling } from './story-doc-page-styling';
import { AddonParameters } from '../../model/addon.model';
import { useTheme } from '../../utils/use-preview-theme';
import { DocPage } from '../doc-page/doc-page';
import { DocTocItem } from '../doc-page/doc-page-toc';

export type StoryTab = 'Overview' | 'API' | 'Styling' | 'Examples';

export function StoryDocPage() {
  const [selectedTab, setSelectedTab] = useState<StoryTab>('Overview');

  const theme = useTheme();
  const context = useContext(DocsContext);
  const resolved = useOf('meta');

  if(resolved.type !== 'meta') {
    return;
  }

  const { overviewProps, title, breadcrumb, apiProps, stylingProps } = useMemo(() => {
    const stories = context.componentStories();
    const primaryStory = stories[0];
    const parameters = primaryStory.parameters as AddonParameters;

    return {
      title: primaryStory.title.split('/').at(-1), // UI Components/Button -> Button
      breadcrumb: primaryStory.title.split('/')[0], // UI Components/Button -> UI Components
      overviewProps: getOverviewProps(parameters, stories, theme),
      apiProps: getApiProps(resolved.preparedMeta, theme),
      stylingProps: getStylingProps(resolved.preparedMeta, parameters)
    };
  }, [theme.id]);

  const tocItemsMap: Record<StoryTab, DocTocItem[]> = useMemo(() => {
    return {
      Overview: overviewProps.stories.map(story => ({id: story.id, name: story.name})),
      API: apiProps.argTypes.map(argType => ({ id: argType.componentName, name: argType.componentName })),
      Styling: [stylingProps.mainComponent, ...stylingProps.subcomponents].map(component => ({ id: component.componentName, name: component.componentName })),
      Examples: [],
    };
  }, []);

  console.log('apiProps', apiProps);
  

  const onTabChange = (event: TabSelectionChangeEvent) => {
    setSelectedTab(event.value as StoryTab);
  };

  return (
    <DocPage breadcrumb={breadcrumb} title={title} tocItems={tocItemsMap[selectedTab]}>
      <StyledTabs selectedValue={selectedTab} onSelectionChange={onTabChange}>
        <Tab label="Overview" value="Overview">
          <StoryDocPageOverview {...overviewProps} />
        </Tab>

        <Tab label="API" value="API">
          <StoryDocPageAPI {...apiProps}/>
        </Tab>

        <Tab label="Styling" value="Styling">
          <StoryDocPageStyling {...stylingProps}/>
        </Tab>

        <Tab label="Examples" value="Examples">
          <StoryDocPageExamples />
        </Tab>
      </StyledTabs>
    </DocPage>
  );
}

const StyledTabs = styled(Tabs)`
  & .doc-cck-tabs__content-wrapper {
    margin-top: 28px;
  }
`;
