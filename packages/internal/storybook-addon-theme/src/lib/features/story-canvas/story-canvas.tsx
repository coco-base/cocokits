import { Story } from "@storybook/blocks";
import { PreparedStory } from "@storybook/types";
import { useEffect, useState } from "react";
import { filter, take } from "rxjs";
import styled from "styled-components";

import { getInstance } from "@cocokits/common-utils";

import { StoryCanvasActions } from "./story-canvas-actions";
import { GlobalEvent } from "../../data-access/global-event/preview-global-event";
import { StorySingleControlActions } from "../story-control/story-single-control-actions";
import { StorySourceCode } from "../story-source-code/story-source-code";

export interface StoryCanvasProps {
  story: PreparedStory;
}


export function StoryCanvas({story}: StoryCanvasProps) {

  const [isCodeSelected, setIsCodeSelected] = useState(false);
  const [isStoryRetested, setIsStoryRetested] = useState(false);

  useEffect(() => {
    getInstance(GlobalEvent).dispatch.newStory(story);
  }, []);

  useEffect(() => {
    // Make sure the story args is ready and the component will get the correct args, otherwise the 'cckControl' will be undefined and stories return error
    const subscription = getInstance(GlobalEvent).changeStoryControl$.pipe(
      filter(({storyId}) => storyId === story.id),
      take(1)
    ).subscribe(() => {
      setIsStoryRetested(true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const onCodeClick = () => setIsCodeSelected(!isCodeSelected);

  if(!isStoryRetested) {
    return;
  }

  return (
    <StyledHost>
      <StyledStoryWrapper>
        <Story of={story.moduleExport} />
        <StoryCanvasActions story={story} isCodeSelected={isCodeSelected} onCodeClick={onCodeClick}/>
        <StorySingleControlActions story={story}/>
      </StyledStoryWrapper>

      { isCodeSelected && <StorySourceCode story={story}/> }
    </StyledHost>
  );
}

const StyledHost = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid var(--cck-doc-color-border-2);
  border-radius: var(--cck-doc-radius-md);
  margin: 48px 0;
`;

const StyledStoryWrapper = styled.div`
  position: relative;
  min-height: 270px;
  width: 100%;
  border-radius: var(--cck-doc-radius-md);
  display: flex;
  justify-content: center;
  align-items: center;

  background-image: 
    linear-gradient(90deg, var(--cck-doc-color-main-effect-surface-end) 0%, var(--cck-doc-color-main-effect-surface-start) 50%, var(--cck-doc-color-main-effect-surface-end) 100%),
    linear-gradient(180deg, var(--cck-doc-color-main-effect-surface-end) 3.62%, var(--cck-doc-color-main-effect-surface-start) 51.49%, var(--cck-doc-color-main-effect-surface-end) 100%),
    radial-gradient(circle at 3px 3px, var(--cck-doc-color-bg-5) 3px, transparent 3px);
  background-repeat: no-repeat, no-repeat, repeat;
  background-size: cover, cover, 16px 16px;
`;


