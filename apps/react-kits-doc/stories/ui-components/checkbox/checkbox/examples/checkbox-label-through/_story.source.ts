// (Do not edit directly)
// (Auto generated by the Cocokits 'generate-example-story-source' on Sat Mar 15 2025

import { AddonParametersSource, ThemeId } from '@cocokits/storybook-addon-theme';

export const SOURCE: AddonParametersSource[] = [
  {
    language: 'tsx',
    filename: 'CheckboxLabelThrough.styled.tsx',
    code: `
import styled from 'styled-components';

const StrikedLabel = styled.span\`
  text-decoration: line-through;
\`;

export const Styled = {
  StrikedLabel,
};
`,
  },
  {
    language: 'tsx',
    filename: 'CheckboxLabelThrough.tsx',
    code: `

import { Checkbox } from '@cocokits/react-checkbox';

import { Styled } from './CheckboxLabelThrough.styled';

export function CheckboxLabelThrough() {
  return (
    <Checkbox size="md" value="YOUR_VALUE">
      <Styled.StrikedLabel>Checkbox Label</Styled.StrikedLabel>
    </Checkbox>
  );
}
`,
  },
];
