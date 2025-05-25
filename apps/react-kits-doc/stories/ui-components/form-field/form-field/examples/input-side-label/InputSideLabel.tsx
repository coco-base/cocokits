import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/form-field/input-side-label.config';
import { FormField, Input, Label } from '@cocokits/react-form-field';

import { Styled } from './InputSideLabel.styled';

export function InputSideLabel(props: { cckExampleArgs: ExampleArgs }) {
  return (
    <Styled.Host>
      <Label htmlFor="city">City</Label>
      <FormField>
        <Input id="city" />
      </FormField>

      <Label htmlFor="country">Country</Label>
      <FormField>
        <Input id="country" />
      </FormField>
    </Styled.Host>
  );
}
