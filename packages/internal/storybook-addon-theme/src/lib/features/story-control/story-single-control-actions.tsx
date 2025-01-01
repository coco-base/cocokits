import { PreparedStory } from '@storybook/types';
import styled from 'styled-components';

import { StorySingleControl } from './story-single-control';
import { AddonParameters } from '../../model/addon.model';

interface StorySingleControlActionsProps {
  story: PreparedStory;
}

export function StorySingleControlActions({ story }: StorySingleControlActionsProps) {
  const parameters = story.parameters as AddonParameters;
  const singleControls = parameters.cckAddon.singleControls;

  if (!singleControls || singleControls.length === 0) {
    return;
  }

  if(!story.argTypes['cckControl']) {
    throw new Error(`'cckControl' argTypes is missing for story ID: ${story.id}`);
  }

  return (
    <StyledHost>
      {singleControls.map((argName, index) => (
        <StorySingleControl story={story} argName={argName} key={index} />
      ))}
    </StyledHost>
  );
}

const StyledHost = styled.div`
  position: absolute;
  bottom: 8px;
  left: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 1;
`;
