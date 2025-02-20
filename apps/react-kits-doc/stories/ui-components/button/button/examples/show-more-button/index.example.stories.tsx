import styled, { css } from 'styled-components';

import { CSS_VARIABLES, TEMPLATE_ARGS } from '@cocokits/common-kits-doc/examples-config/button/show-more-button.config';
import { renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-react';

import { SOURCE } from './_story.source';
import { ShowMoreButton } from './ShowMoreButton';

export const ShowMoreButtonStory: StoryObj<typeof ShowMoreButton> = {
  name: 'Volume Button',
  parameters: {
    cckAddon: {
      renderConditions: [renderWithPageTab('Examples')],
      source: SOURCE,
      exampleStory: {
        templateArgsMap: TEMPLATE_ARGS,
        cssArgsMap: CSS_VARIABLES,
      },
    },
  },
  render: (args) => (
    <InlineStyle styles={args.cckExampleVariables}>
      <ShowMoreButton cckExampleArgs={args.cckExampleArgs} />
    </InlineStyle>
  ),
};

const InlineStyle = styled.div<{ styles: string }>`
  ${({ styles }) => css`
    ${styles}
  `}
`;
