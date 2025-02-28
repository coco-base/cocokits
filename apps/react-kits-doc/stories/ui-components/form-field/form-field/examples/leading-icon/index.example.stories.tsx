import styled, { css } from 'styled-components';

import { CSS_VARIABLES, TEMPLATE_ARGS } from '@cocokits/common-kits-doc/examples-config/form-field/leading-icon.config';
import { renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-react';

import { SOURCE } from './_story.source';
import { LeadingIcon } from './LeadingIcon';

export const LeadingIconStory: StoryObj<typeof LeadingIcon> = {
  name: 'Leading Icon',
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
      <LeadingIcon cckExampleArgs={args.cckExampleArgs} />
    </InlineStyle>
  ),
};

const InlineStyle = styled.div<{ styles: string }>`
  ${({ styles }) => css`
    ${styles}
  `}
`;
