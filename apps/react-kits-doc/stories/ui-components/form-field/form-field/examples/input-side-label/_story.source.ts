/* eslint-disable @typescript-eslint/no-unused-vars */
// (Do not edit directly)
// (Auto generated by the Cocokits 'generate-example-story-source')

import { AddonParametersSource, ThemeId } from '@cocokits/storybook-addon-theme';

export const SOURCE: AddonParametersSource[] = [
  {
    language: 'tsx',
    filename: 'InputSideLabel.styled.tsx',
    code: `
import styled from "styled-components";


const Host = styled.div\`
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: 1fr 1fr;
  align-items: center;
  justify-items: end;
  gap: 8px 12px;
\`;

export const Styled = {
  Host,
};

`,
  },
  {
    language: 'tsx',
    filename: 'InputSideLabel.tsx',
    code: `

import { FormField, Input, Label } from '@cocokits/react-form-field';

import { Styled } from './InputSideLabel.styled';

export function InputSideLabel() {
  return (
    <Styled.Host>
      <Label htmlFor='city'>City</Label>
      <FormField>
        <Input id="city"/>
      </FormField>

      <Label htmlFor='country'>Country</Label>
      <FormField>
        <Input id='country'/>
      </FormField>

    </Styled.Host>
  );
}
`,
  },
];
