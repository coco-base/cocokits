import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/form-field/email-validation.config';
import { FormField, Label, Input, SvgIcon, Error } from '@cocokits/react-components';
import { useState } from 'react';
import { Icons } from '@cocokits/common-icons';

export function EmailValidation(props: { cckExampleArgs: ExampleArgs }) {
  const [invalid, setInvalid] = useState(true);
  const [touched, setTouched] = useState(false);

  const onInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setInvalid(!emailRegex.test(value));
  };

  return (
    <FormField invalid={invalid && touched}>
      <Label>Email</Label>
      <Input type="email" onInput={onInput} onBlur={() => setTouched(true)} />
      {
        invalid && touched && (
          <Error>
            <SvgIcon icon={Icons.warning} />
            <span>Enter a valid email address</span>
          </Error>
        )
      }
    </FormField>
  );
}
