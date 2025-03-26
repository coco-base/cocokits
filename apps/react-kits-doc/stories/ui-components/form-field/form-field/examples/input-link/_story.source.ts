/* eslint-disable @typescript-eslint/no-unused-vars */
// (Do not edit directly)
// (Auto generated by the Cocokits 'generate-example-story-source')

import { AddonParametersSource, ThemeId } from '@cocokits/storybook-addon-theme';

export const SOURCE: AddonParametersSource[] = [
  {
    language: 'tsx',
    filename: 'InputLink.tsx',
    code: `
import { Icons } from '@cocokits/common-icons';

import { FormField, Hint, Input, Label, Prefix, SvgIcon } from '@cocokits/react-components';

export function InputLink() {
  return (
    <FormField>
      <Label>Link</Label>
      <Input placeholder="Example.com" />
      <Prefix>
        <SvgIcon icon={Icons.link}></SvgIcon>
      </Prefix>
      <Hint>Enter a valid link to your website</Hint>
    </FormField>
  );
}
`,
  },
];
