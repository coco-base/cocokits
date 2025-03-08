// (Do not edit directly)
// (Auto generated by the Cocokits 'generate-example-story-source' on Wed Mar 05 2025

import { AddonParametersSource, ThemeId } from '@cocokits/storybook-addon-theme';

export const SOURCE: AddonParametersSource[] = [
  {
    language: 'tsx',
    filename: 'InputSuffixSuccess.tsx',
    code: `
import { useState } from 'react';

import { Icons } from '@cocokits/common-icons';

import { FormField, Hint, Input, Label, Suffix, SvgIcon } from '@cocokits/react-components';

export function InputSuffixSuccess() {
  const [value, setValue] = useState('');
  
      
  return (
    <FormField>
      <Label>Confirm email</Label>
      <Input placeholder='Enter hello@cocokits.com' onChange={e => setValue(e.target.value)}/>
      <Suffix>
        { value === 'hello@cocokits.com' && <SvgIcon icon={Icons.checkCircle} color='<%= iconColor %>' size='<%= iconSize %>'/> }
      </Suffix>
      <Hint>Enter your email address again</Hint>
    </FormField>
  );
}
`,
  },
];
