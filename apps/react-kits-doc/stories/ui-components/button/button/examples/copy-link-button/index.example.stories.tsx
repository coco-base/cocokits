import styled, { css } from 'styled-components';

import { CSS_VARIABLES, TEMPLATE_ARGS } from '@cocokits/common-kits-doc/examples-config/button/copy-link-button.config';
import { renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-react';

import { SOURCE } from './_story.source';
import { CopyLinkButton } from './CopyLinkButton';

export const CopyLinkButtonStory: StoryObj<typeof CopyLinkButton> = {
  name: 'Copy Link Button',
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
      <CopyLinkButton cckExampleArgs={args.cckExampleArgs}/>
    </InlineStyle>
  )
};


const InlineStyle = styled.div<{ styles: string }>`
  ${({ styles }) => css`${styles}`}
`;