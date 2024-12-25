import { DocsContext } from "@storybook/blocks";
import { useContext } from "react";

import { useTheme } from "../../utils/use-preview-theme";
import { filterStoryByScenario, filterStoryByThemeTag } from "../doc-page/doc-page.util";
import { DocPageMarkdown } from "../doc-page/doc-page-markdown";
import { DocPageSection } from "../doc-page/doc-page-section";
import { StoryCanvas } from "../story-canvas/story-canvas";

export function StoryDocPageOverview() {  

  const {dispatchTheme, ...theme} = useTheme();
  const context = useContext(DocsContext);
  const stories = context.componentStories();
  const primaryStory = stories[0];
  const metaDescription: string = primaryStory.parameters['docs']?.description?.component;

  const storiesData = stories
    .filter(story => filterStoryByThemeTag(story, theme.id))
    .filter(story => filterStoryByScenario(story, theme));


  return (
    <>
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
    </>
  );
}

