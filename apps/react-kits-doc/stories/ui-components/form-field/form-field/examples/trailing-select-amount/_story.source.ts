// (Do not edit directly)
// (Auto generated by the Cocokits 'generate-example-story-source' on Wed Mar 12 2025

import { AddonParametersSource, ThemeId } from '@cocokits/storybook-addon-theme';

export const SOURCE: AddonParametersSource[] = [
  {
    language: 'tsx',
    filename: 'TrailingSelectAmount.tsx',
    code: `
import { useState } from 'react';


import { FormField, Input, Label, Option, removeAmountFormat, Select, toAmountFormat, Trailing } from '@cocokits/react-components';


export function TrailingSelectAmount() {

  const [value, setValue] = useState('');

  return (
    <FormField>
      <Label>Select amount</Label>
      <Input
        value={value}
        onFocus={() => setValue(removeAmountFormat(value))}
        onBlur={() => setValue(toAmountFormat(value))}
        onChange={e => setValue(e.target.value)}/>
      <Trailing>
        <Select value="USD">
          <Option value="USD">USD</Option>
          <Option value="EUR">EUR</Option>
          <Option value="JPY">JPY</Option>
          <Option value="CNY">CNY</Option>
          <Option value="KRW">KRW</Option>
        </Select>
      </Trailing>
    </FormField>
  );
}
`,
  },
];
