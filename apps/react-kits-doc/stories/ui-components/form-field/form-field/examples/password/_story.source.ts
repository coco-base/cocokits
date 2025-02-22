// (Do not edit directly)
// (Auto generated by the Cocokits 'generate-example-story-source' on Fri Feb 21 2025

import { AddonParametersSource, ThemeId } from '@cocokits/storybook-addon-theme';

export const SOURCE: AddonParametersSource[] = [
  {
    language: 'tsx',
    filename: 'Password.tsx',
    code: `
import { Icons } from '@cocokits/common-icons';

import { FormField, Hint,Input, Label } from '@cocokits/react-components';
import { SvgIcon } from '@cocokits/react-icon';

export function Password() {
  return (
    <FormField required={true}>
      <Label>Password</Label>
      <Input type="password" placeholder="Enter your password"/>
      <Hint>
        <SvgIcon icon={Icons.info}/>
        <span>Your password must be at least 10 characters long</span>
      </Hint>
    </FormField>
  );
}
`,
  },
];
