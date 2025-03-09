import { Icons } from '@cocokits/common-icons';
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/form-field/leading-icon.config';
import { FormField, Input, Label, Leading, SvgIcon } from '@cocokits/react-components';

export function LeadingIcon(props: { cckExampleArgs: ExampleArgs }) {
  return (
    <FormField>
      <Label>Enter username</Label>
      <Leading>
        <SvgIcon icon={Icons.user}/>
      </Leading>
      <Input/>
    </FormField>
  );
}
