import { Icons } from '@cocokits/common-icons';
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/input/password.config';
import { FormField, Hint,Input, Label } from '@cocokits/react-components';
import { SvgIcon } from '@cocokits/react-icon';

export function Password(props: { cckExampleArgs: ExampleArgs }) {
  return (
    <FormField required={true}>
      <Label>Password</Label>
      <Input type="password" placeholder="Enter your password"/>
      <Hint>
        <SvgIcon icon={Icons.info}/>
        <span>At least 10 characters long</span>
      </Hint>
    </FormField>
  );
}
