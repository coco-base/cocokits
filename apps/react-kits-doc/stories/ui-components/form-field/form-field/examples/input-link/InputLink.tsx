import { Icons } from '@cocokits/common-icons';
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/form-field/input-link.config';
import { FormField, Hint, Input, Label, Prefix, SvgIcon } from '@cocokits/react-components';

export function InputLink(props: { cckExampleArgs: ExampleArgs }) {
  return (
    <FormField>
      <Label>Link</Label>
      <Input placeholder="Example.com" />
      <Prefix>
        <SvgIcon icon={Icons.link}></SvgIcon>
      </Prefix>
      <Hint>Enter a valid link to your website</Hint>
    </FormField>
  );
}
