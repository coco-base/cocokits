/* eslint-disable @typescript-eslint/no-unused-vars */
// (Do not edit directly)
// (Auto generated by the Cocokits 'generate-example-story-source' on Tue Mar 25 2025

import { AddonParametersSource, ThemeId } from '@cocokits/storybook-addon-theme';

export const SOURCE: AddonParametersSource[] = [
  {
    language: 'tsx',
    filename: 'TrailingDomain.tsx',
    code: `

import { FormField, Input, Label, Trailing } from '@cocokits/react-components';

export function TrailingDomain() {
  return (
    <FormField>
      <Label>Choose domain name</Label>
      <Input/>
      <Trailing>.com</Trailing>
    </FormField>
  );
}
`,
  },
];
