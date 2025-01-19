import { renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-react';

import { CSS_VARIABLES, TEMPLATE_ARGS } from './_story.config';
import { SOURCE } from './_story.source';
import { VolumeButton } from './VolumeButton';
import styled, { css } from 'styled-components';

export const VolumeButtonStory: StoryObj<typeof VolumeButton> = {
  name: 'Volume Button',
  parameters: {
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
      exampleStory: {
        templateArgsMap: TEMPLATE_ARGS,
        cssArgsMap: CSS_VARIABLES
      }
    },
  },
  render: (args) => (
    <InlineStyle styles={args.cckExampleVariables}>
      <VolumeButton cckExampleArgs={args.cckExampleArgs}/>
    </InlineStyle>
  )
};


const InlineStyle = styled.div<{ styles: string }>`
  ${({ styles }) => css`${styles}`}
`;