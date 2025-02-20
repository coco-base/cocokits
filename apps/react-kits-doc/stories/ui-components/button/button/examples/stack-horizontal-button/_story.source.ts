// (Do not edit directly)
// (Auto generated by the Cocokits 'generate-example-story-source' on Thu Feb 20 2025

import { AddonParametersSource, ThemeId } from '@cocokits/storybook-addon-theme';

export const SOURCE: AddonParametersSource[] = [
  {
    language: 'tsx',
    filename: 'StackHorizontalButton.tsx',
    code: `
import styled from 'styled-components';


import { Button } from '@cocokits/react-components';

export function StackHorizontalButton() {
  return (
    <HostStyles>
      <Button
        type='<%= firstButtonType %>'
        size='<%= firstButtonSize %>'
        color='<%= firstButtonColor %>'>
        Cancel
      </Button>

      <Button
        type='<%= secondButtonType %>'
        size='<%= secondButtonSize %>'
        color='<%= secondButtonColor %>'>
        Confirm
      </Button>
    </HostStyles>
  );
}

const HostStyles = styled.div\`
  display: flex;
  gap: 12px;
\`;
`,
  },
];
