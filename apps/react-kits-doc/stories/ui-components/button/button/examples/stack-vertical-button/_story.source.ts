// (Do not edit directly)
// (Auto generated by the Cocokits 'generate-example-story-source' on Wed Mar 12 2025

import { AddonParametersSource, ThemeId } from '@cocokits/storybook-addon-theme';

export const SOURCE: AddonParametersSource[] = [
  {
    language: 'tsx',
    filename: 'StackVerticalButton.tsx',
    code: `
import React from 'react';
import { styled } from 'styled-components';


import { Button, SvgIcon } from '@cocokits/react-components';
import { Icons } from '@cocokits/common-icons';

export function StackVerticalButton() {
  return (
    <HostStyles>
      <Button
        type='<%= firstButtonType %>'
        size='<%= firstButtonSize %>'
        color='<%= firstButtonColor %>'>
        Skip
      </Button>

      <Button
        type='<%= secondButtonType %>'
        size='<%= secondButtonSize %>'
        color='<%= secondButtonColor %>'>
        Confirm
        <SvgIcon icon={Icons.arrowRight}/>
      </Button>
    </HostStyles>
  );
}

const HostStyles = styled.div\`
  display: flex;
  flex-direction: column;
  width: 150px;
  gap: 12px;
\`;
`,
  },
];
