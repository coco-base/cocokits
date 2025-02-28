import { useState } from 'react';

import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/form-field/trailing-select-amount.config';
import { FormField, Input, Label, Option, Select, Trailing } from '@cocokits/react-components';

import { formatValue, unFormatValue } from './TrailingSelectAmount.util';

export function TrailingSelectAmount(props: { cckExampleArgs: ExampleArgs }) {

  const [value, setValue] = useState('');

  return (
    <FormField>
      <Label>Select amount</Label>
      <Input
        value={value}
        onFocus={() => setValue(unFormatValue(value))}
        onBlur={() => setValue(formatValue(value))}
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
