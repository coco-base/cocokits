import { PreparedStory } from "@storybook/types";

import { DocPageMarkdown } from "../doc-page/doc-page-markdown";
import { DocPageSection } from "../doc-page/doc-page-section";
import { StoryCanvas } from "../story-canvas/story-canvas";
import { AddonParameters } from "../../model/addon.model";

export interface StoryDocPageOverviewProps {
  metaDescription: string | undefined;
  stories: PreparedStory[];
}

export function StoryDocPageOverview({metaDescription, stories}: StoryDocPageOverviewProps) {  

  const getDescription = (story: PreparedStory) => {
    const parameters = story.parameters as AddonParameters;
    return parameters.docs.description.story;
  };

  return (
    <>
      <DocPageMarkdown>{metaDescription}</DocPageMarkdown>
      { stories.map(story => (
        <DocPageSection
          key={story.id}
          id={story.id}
          title={story.name}
          description={getDescription(story)}>
          <StoryCanvas story={story} />
        </DocPageSection>
      ))}
    </>
  );
}

