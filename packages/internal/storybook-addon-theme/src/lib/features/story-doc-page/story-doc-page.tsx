import { Canvas, DocsContext } from "@storybook/blocks";
import { useContext } from "react";

import { useTheme } from "../../utils/use-preview-theme";
import { DocPage } from "../doc-page/doc-page";
import { filterStoryByScenario, filterStoryByThemeTag } from "../doc-page/doc-page.util";
import { DocPageMarkdown } from "../doc-page/doc-page-markdown";
import { DocPageSection } from "../doc-page/doc-page-section";
import { StoryCanvas } from "../story-canvas/story-canvas";

export function StoryDocPage() {  

  const {dispatchTheme, ...theme} = useTheme();
  const context = useContext(DocsContext);
  const stories = context.componentStories();
  const primaryStory = stories[0];

  const breadcrumb = primaryStory.title.split('/')[0]; // Title Example: UI Components/Button
  const title = primaryStory.title.split('/').at(-1); // Title Example: UI Components/Button
  const metaDescription: string = primaryStory.parameters['docs']?.description?.component;
  const storiesWithoutPrimary = stories.slice(1);

  const storiesData = stories
    .filter(story => filterStoryByThemeTag(story, theme.id))
    .filter(story => filterStoryByScenario(story, theme));

  const tokItems = stories
    .filter(story => filterStoryByThemeTag(story, theme.id))
    .map(story => ({
      id: story.id, name:
        story.name.replace(/^(theme|Theme) [^:]+: /, '') // Replace 'Theme XXX: AAA' to 'AAA'
    }));

  // const API_SECTION = { id: `${primaryStory.componentId}--api`, name: 'API' };
  // tokItems.push(API_SECTION);

  // console.log('StoryDocPage', theme, metaDescription, storiesWithoutPrimary, primaryStory);

  return (
    <DocPage breadcrumb={breadcrumb} title={title} tocItems={tokItems}>
      <DocPageMarkdown>{metaDescription}</DocPageMarkdown>
      { storiesData.map(story => (
        <DocPageSection
          key={story.id}
          id={story.id}
          title={story.name}
          description={story.parameters['docs']?.description?.story}>
          <StoryCanvas story={story} />
        </DocPageSection>
      ))}
    </DocPage>
  );
}

