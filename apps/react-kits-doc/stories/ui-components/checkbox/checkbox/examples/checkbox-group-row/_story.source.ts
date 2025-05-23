/* eslint-disable */
// (Do not edit directly)
// (Auto generated by the Cocokits 'generate-example-story-source')

import { AddonParametersSource, ThemeId } from '@cocokits/storybook-addon-theme';

export const SOURCE: AddonParametersSource[] = [
  {
    language: 'tsx',
    filename: 'CheckboxGroupRow.styled.tsx',
    code: `
import styled from 'styled-components';

const Label = styled.span\`
  color: var(--checkbox-group-column-color);
  font-style: italic;
  font-family: var(--checkbox-group-column-font-family);
\`;

const CheckboxGroup = styled.div\`
  display: flex;
  flex-direction: row;
  gap: 12px;
  margin-top: 10px;
\`;

export const Styled = {
  Label,
  CheckboxGroup,
};
`,
  },
  {
    language: 'tsx',
    filename: 'CheckboxGroupRow.tsx',
    code: `

import { Checkbox } from '@cocokits/react-components';

import { Styled } from './CheckboxGroupRow.styled';

export function CheckboxGroupRow() {
  return (
    <div>
      <Styled.Label>Favorite food</Styled.Label>
      <Styled.CheckboxGroup>
        <Checkbox size='<%= size %>' value={1}>
          Pizza
        </Checkbox>
        <Checkbox size='<%= size %>' value={2}>
          Pasta
        </Checkbox>
        <Checkbox size='<%= size %>' value={3}>
          Fruits
        </Checkbox>
      </Styled.CheckboxGroup>
    </div>
  );
}
`,
  },
  {
    language: 'scss',
    filename: 'global.scss',
    code: `
      :root {--checkbox-group-column-color: var(--color-palette-gray-800);
        --checkbox-group-column-font-family: Inter;
      }`,
    visibleConditions: [(theme) => theme.id === ThemeId.CocoKits],
  },
  {
    language: 'scss',
    filename: 'global.scss',
    code: `
      :root {--checkbox-group-column-color: var(--colors-gray-300);
        --checkbox-group-column-font-family: var(--font-family);
      }`,
    visibleConditions: [(theme) => theme.id === ThemeId.FramesX],
  },
];
