import { PreparedStory } from '@storybook/types';
import styled from 'styled-components';

import { AddonParameters } from '../../model/addon.model';
import { StoryStackblitzButton } from '../stackblitz/story-stackblitz-button';
import { StoryControlButton } from '../story-control/story-control-button';
import { StorySourceCodeButton } from '../story-source-code/story-source-code-button';

export interface StoryCanvasActionsProps {
  story: PreparedStory;
  isCodeSelected: boolean;
  onCodeClick: () => void;
}

export function StoryCanvasActions({ story, isCodeSelected, onCodeClick }: StoryCanvasActionsProps) {
  const parameters = story.parameters as AddonParameters;
  const hasControl = parameters.cckAddon.hasControl ?? false;
  const hasStackblitz = parameters.cckAddon.hasStackblitz ?? false;
  const hasCode = parameters.cckAddon.hasCode ?? true;

  return (
    <StyledHost>
      {hasStackblitz && <StoryStackblitzButton story={story} />}
      {hasCode && <StorySourceCodeButton selected={isCodeSelected} onCodeClick={onCodeClick} />}
      {hasControl && <StoryControlButton story={story} />}
    </StyledHost>
  );
}

const StyledHost = styled.div`
  position: absolute;
  bottom: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
  z-index: 1;
`;
