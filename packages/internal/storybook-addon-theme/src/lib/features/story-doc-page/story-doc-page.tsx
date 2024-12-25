import { DocsContext } from "@storybook/blocks";
import { TabSelectionChangeEvent } from "packages/react/tabs/src/lib/tabs.store";
import { useContext, useState } from "react";
import styled from "styled-components";

import { Tab, Tabs } from "@cocokits/react-tabs";

import { StoryDocPageAPI } from "./story-doc-page-api";
import { StoryDocPageExamples } from "./story-doc-page-examples";
import { StoryDocPageOverview } from "./story-doc-page-overview";
import { DocPage } from "../doc-page/doc-page";
import { DocTocItem } from "../doc-page/doc-page-toc";

type StoryTabs = 'Overview' | 'API' | 'Styling' | 'Examples';

export function StoryDocPage() {  

  const [selectedTab, setSelectedTab] = useState<StoryTabs>('Overview');
  const [tocItems, setTocItems] = useState<DocTocItem[]>([{id: '', name: ''}]);

  const context = useContext(DocsContext);
  const stories = context.componentStories();
  const primaryStory = stories[0];

  const breadcrumb = primaryStory.title.split('/')[0]; // Title Example: UI Components/Button
  const title = primaryStory.title.split('/').at(-1); // Title Example: UI Components/Button
  // const metaDescription: string = primaryStory.parameters['docs']?.description?.component;

  // const storiesData = stories
  //   .filter(story => filterStoryByThemeTag(story, theme.id))
  //   .filter(story => filterStoryByScenario(story, theme));


  // const tokItems = stories
  //   .filter(story => filterStoryByThemeTag(story, theme.id))
  //   .map(story => ({
  //     id: story.id, name:
  //       story.name.replace(/^(theme|Theme) [^:]+: /, '') // Replace 'Theme XXX: AAA' to 'AAA'
  //   }));

  // const API_SECTION = { id: `${primaryStory.componentId}--api`, name: 'API' };
  // tokItems.push(API_SECTION);

  // console.log('StoryDocPage', theme, metaDescription, storiesWithoutPrimary, primaryStory);


  const onTabChange = (event: TabSelectionChangeEvent) => {
    setSelectedTab(event.value as StoryTabs);
  };

  return (
    <DocPage breadcrumb={breadcrumb} title={title} tocItems={tocItems}>

      <StyledTabs selectedValue={selectedTab} onSelectionChange={onTabChange}>
        <Tab label='Overview' value='Overview'>
          <StoryDocPageOverview/>
        </Tab>

        <Tab label='API' value='API'>
          <StoryDocPageAPI/>
        </Tab>

        <Tab label='Styling' value='Styling'>
          <p>TODO: Styling</p>
        </Tab>

        <Tab label='Examples' value='Examples'>
          <StoryDocPageExamples/>
        </Tab>
      </StyledTabs>
      {/* <DocPageMarkdown>{metaDescription}</DocPageMarkdown>
      { storiesData.map(story => (
        <DocPageSection
          key={story.id}
          id={story.id}
          title={story.name}
          description={story.parameters['docs']?.description?.story}>
          <StoryCanvas story={story} />
        </DocPageSection>
      ))} */}
    </DocPage>
  );
}


const StyledTabs = styled(Tabs)`
  & .doc-cck-tabs__content-wrapper {
    margin-top: 28px;
  }
`;