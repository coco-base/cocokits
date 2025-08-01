/* eslint-disable */
// (Do not edit directly)
// (Auto generated by the Cocokits 'generate-example-story-source')

import { AddonParametersSource, ThemeId } from '@cocokits/storybook-addon-theme';

export const SOURCE: AddonParametersSource[] = [
  {
    language: 'tsx',
    filename: 'SocialButtons.tsx',
    code: `
import styled from "styled-components";

import { Icons } from '@cocokits/common-icons';

import { IconButton, SvgIcon } from '@cocokits/react-components';

export function SocialButtons() {
  return (
    <HostStyled>
      <IconButton color='<%= color %>' type='<%= type %>' size='<%= size %>'>
        <SvgIcon icon={Icons.x} size='<%= iconSize %>' />
      </IconButton>

      <IconButton color='<%= color %>' type='<%= type %>' size='<%= size %>'>
        <SvgIcon icon={Icons.github} size='<%= iconSize %>' />
      </IconButton>

      <IconButton color='<%= color %>' type='<%= type %>' size='<%= size %>'>
        <SvgIcon icon={Icons.instagram} size='<%= iconSize %>' />
      </IconButton>
    </HostStyled>
  );
}

const HostStyled = styled.div\`
  display: flex;
  gap: 8px;
\`;
`,
  },
];
