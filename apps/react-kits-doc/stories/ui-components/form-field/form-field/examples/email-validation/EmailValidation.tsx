import { useForm } from 'react-hook-form';

import { Icons } from '@cocokits/common-icons';
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/form-field/email-validation.config';
import { Error, FormField, Input, Label, SvgIcon } from '@cocokits/react-components';

export function EmailValidation(props: { cckExampleArgs: ExampleArgs }) {
  const {
    control,
    formState: { errors },
  } = useForm<{email: string}>({mode: 'onTouched'});

  
  return (
    <FormField>
      <Label>Email</Label>
      <Input
        type="email"
        name="email"
        control={control}
        rules={{
          required: "Email is required",
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: "Enter a valid email address"
          },
        }}/>
      {
        errors.email && (
          <Error>
            <SvgIcon icon={Icons.warning} />
            <span>{errors.email.message}</span>
          </Error>
        )
      }
    </FormField>
  );
}
