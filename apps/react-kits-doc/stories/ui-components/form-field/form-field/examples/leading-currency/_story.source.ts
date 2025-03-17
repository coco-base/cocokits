// (Do not edit directly)
// (Auto generated by the Cocokits 'generate-example-story-source' on Wed Mar 12 2025

import { AddonParametersSource, ThemeId } from '@cocokits/storybook-addon-theme';

export const SOURCE: AddonParametersSource[] = [
  {
    language: 'tsx',
    filename: 'LeadingCurrency.tsx',
    code: `
import { useState } from 'react';

import { Icons } from '@cocokits/common-icons';

import { FormField, Input, Label, Leading, removeAmountFormat, SvgIcon, toAmountFormat } from '@cocokits/react-components';

export function LeadingCurrency() {

  const [value, setValue] = useState('');

  return (
    <FormField>
      <Label>Select currency</Label>
      <Leading>
        <SvgIcon icon={Icons.dollarMoney} />
      </Leading>
      <Input
        value={value}
        onFocus={() => setValue(removeAmountFormat(value))}
        onBlur={() => setValue(toAmountFormat(value))}
        onChange={e => setValue(e.target.value)}/>
    </FormField>
  );
}
`,
  },
];
