import { useState } from 'react';

import { Icons } from '@cocokits/common-icons';
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/form-field/input-suffix-success.config';
import { FormField, Hint, Input, Label, Suffix, SvgIcon } from '@cocokits/react-components';

export function InputSuffixSuccess(props: { cckExampleArgs: ExampleArgs }) {
  const [value, setValue] = useState('');
  
      
  return (
    <FormField>
      <Label>Confirm email</Label>
      <Input placeholder='Enter hello@cocokits.com' onChange={e => setValue(e.target.value)}/>
      <Suffix>
        { value === 'hello@cocokits.com' && <SvgIcon icon={Icons.checkCircle} color={props.cckExampleArgs.iconColor} size={props.cckExampleArgs.iconSize}/> }
      </Suffix>
      <Hint>Enter your email address again</Hint>
    </FormField>
  );
}
