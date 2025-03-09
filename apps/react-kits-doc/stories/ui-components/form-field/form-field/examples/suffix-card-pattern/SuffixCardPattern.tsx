import InputMask from '@mona-health/react-input-mask';

import { Icons } from '@cocokits/common-icons';
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/form-field/suffix-card-pattern.config';
import { FormField, Input,Label, Suffix, SvgIcon } from '@cocokits/react-components';

export function SuffixCardPattern(props: { cckExampleArgs: ExampleArgs }) {
  return (
    <FormField>
      <Label>Card information</Label>
      <InputMask mask="9999 9999 9999 9999" maskPlaceholder={null}>
        <Input/>
      </InputMask>
      <Suffix>
        <SvgIcon icon={Icons.card}/>
      </Suffix>
    </FormField>
  );
}
