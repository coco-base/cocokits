import { useForm } from 'react-hook-form';

import { Icons } from '@cocokits/common-icons';
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/form-field/input-hint-success.config';
import { Error,FormField, Hint, Input, Label, SvgIcon } from '@cocokits/react-components';

export function InputHintSuccess(props: { cckExampleArgs: ExampleArgs }) {
  const {
    control,
    formState: { errors, isValid },
  } = useForm<{username: string}>({mode: 'onTouched'});

    
  return (
    <FormField>
      <Label>Username</Label>
      <Input
        name="username"
        control={control}
        rules={{
          required: "Username is required",
          minLength: {
            value: 3,
            message: "Must be at least 3 characters",
          },
          maxLength: {
            value: 10,
            message: "Cannot exceed 10 characters",
          },
          pattern: {
            value: /^[A-Za-z0-9-]+$/,
            message: "Only letters, digits, and hyphens allowed",
          },
        }}
      />
      {
        isValid && (
          <Hint color={props.cckExampleArgs.hintColor}>
            <SvgIcon icon={Icons.checkCircle} />
            <span>Username is available!</span>
          </Hint>
        )
      }
      {
        errors.username && (
          <Error>
            <SvgIcon icon={Icons.warning} />
            <span>{errors.username.message}</span>
          </Error>
        )
      }
    </FormField>
  );
}
