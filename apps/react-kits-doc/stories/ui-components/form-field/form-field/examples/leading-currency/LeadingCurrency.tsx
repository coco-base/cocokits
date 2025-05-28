import { useState } from 'react';

import { Icons } from '@cocokits/common-icons';
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/form-field/leading-currency.config';
import {
  FormField,
  Input,
  Label,
  Leading,
  removeAmountFormat,
  SvgIcon,
  toAmountFormat,
} from '@cocokits/react-components';

export function LeadingCurrency(props: { cckExampleArgs: ExampleArgs }) {
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
        onChange={(e) => setValue(e.target.value)}
      />
    </FormField>
  );
}
