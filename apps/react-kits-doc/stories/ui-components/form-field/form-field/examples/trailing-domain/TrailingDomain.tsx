import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/form-field/trailing-domain.config';
import { FormField, Input, Label, Trailing } from '@cocokits/react-components';

export function TrailingDomain(props: { cckExampleArgs: ExampleArgs }) {
  return (
    <FormField>
      <Label>Choose domain name</Label>
      <Input/>
      <Trailing>.com</Trailing>
    </FormField>
  );
}
