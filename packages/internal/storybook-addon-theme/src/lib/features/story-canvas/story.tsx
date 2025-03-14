import { Story as StorybookStory } from "@storybook/blocks";
import { PreparedStory } from "@storybook/types";
import { useEffect, useState } from "react";
import { filter, map, take, tap } from "rxjs";

import { getInstance } from "@cocokits/common-utils";
import { Delay } from "@cocokits/react-cdk";

import { StoriesStore } from "./stories.store";
import { StyledLoader } from "../../utils/common-elements";
import { StoryControlStore } from "../story-control/preview-story-args.store";

export interface StoryProps {
  story: PreparedStory;
}
export function Story({story}: StoryProps) {

  const [isArgsAvailable, setIsArgsAvailable] = useState(false);
  const [canRenderStory, setCanRenderStory] = useState(false);
  const storiesStore = getInstance(StoriesStore);
  const controlStore = getInstance(StoryControlStore);
  const of = story.moduleExport;

  // Register/Remove story
  useEffect(() => {
    storiesStore.registerNewStory(story.id);
    const subscription = storiesStore.canRenderStory$(story.id).subscribe(setCanRenderStory);
    const subscription2 = controlStore.getArgs$(story.id).pipe(
      map((args) => Object.keys(args).length > 0),
      filter(Boolean),
      take(1)
    ).subscribe(setIsArgsAvailable);

    return () => {
      storiesStore.removeStory(story.id);
      subscription.unsubscribe();
      subscription2.unsubscribe();
    };
  }, [story.id]);


  if(canRenderStory && isArgsAvailable) {
    return (
      <StorybookStory of={of} />
    );
  }

  return (
    <Delay time={100}>
      <StyledLoader />
    </Delay>
  );

}