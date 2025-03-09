import styled, { css } from 'styled-components';

import { CSS_VARIABLES, TEMPLATE_ARGS } from '@cocokits/common-kits-doc/examples-config/icon-button/volume-button.config';
import { renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-react';

import { SOURCE } from './_story.source';
import { VolumeButton } from './VolumeButton';

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
    <InlineStyle styles={args.cckExampleCssVariables}>
      <VolumeButton cckExampleArgs={args.cckExampleArgs}/>
    </InlineStyle>
  )
};


const InlineStyle = styled.div<{ styles: string }>`
  ${({ styles }) => css`${styles}`}
`;