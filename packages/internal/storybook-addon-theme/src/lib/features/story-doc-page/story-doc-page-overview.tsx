import { PreparedStory } from "@storybook/types";

import { DocPageMarkdown } from "../doc-page/doc-page-markdown";
import { DocPageSection } from "../doc-page/doc-page-section";
import { StoryCanvas } from "../story-canvas/story-canvas";

export interface StoryDocPageOverviewProps {
  metaDescription: string | undefined;
  stories: PreparedStory[];
}

export function StoryDocPageOverview({metaDescription, stories}: StoryDocPageOverviewProps) {  

  return (
    <>
      <DocPageMarkdown>{metaDescription}</DocPageMarkdown>
      { stories.map(story => (
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

