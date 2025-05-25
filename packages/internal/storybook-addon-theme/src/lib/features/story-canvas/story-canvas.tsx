import { PreparedStory } from '@storybook/types';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { getInstance } from '@cocokits/common-utils';

import { Story } from './story';
import { StoryCanvasActions } from './story-canvas-actions';
import { StoryCanvasWrapper } from './story-canvas-wrapper';
import { GlobalEvent } from '../../data-access/global-event/preview-global-event';
import { StorySingleControlActions } from '../story-control/story-single-control-actions';
import { StorySourceCode } from '../story-source-code/story-source-code';

export interface StoryCanvasProps {
  story: PreparedStory;
}

export function StoryCanvas({ story }: StoryCanvasProps) {
  const [isCodeSelected, setIsCodeSelected] = useState(false);

  useEffect(() => {
    getInstance(GlobalEvent).dispatch.newStory(story);
  }, []);

  const onCodeClick = () => {
    const newIsCodeSelected = !isCodeSelected;
    getInstance(GlobalEvent).dispatch.docOverviewSourceToggle({ storyName: story.name, isOpen: newIsCodeSelected });
    setIsCodeSelected(newIsCodeSelected);
  };

  return (
    <StyledHost>
      <StyledStoryCanvasWrapper>
        <Story story={story} />
        <StoryCanvasActions story={story} isCodeSelected={isCodeSelected} onCodeClick={onCodeClick} />
        <StorySingleControlActions story={story} />
      </StyledStoryCanvasWrapper>

      {isCodeSelected && <StorySourceCode story={story} />}
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

const StyledStoryCanvasWrapper = styled(StoryCanvasWrapper)`
  padding: 48px 48px 56px 48px;
  min-height: 270px;
  width: 100%;
`;
