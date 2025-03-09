import { Icons } from '@cocokits/common-icons';
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/form-field/trailing-custom-color.config';
import { FormField, Input, Label, SvgIcon } from '@cocokits/react-components';

import { Styled } from './TrailingCustomColor.styled';

export function TrailingCustomColor(props: { cckExampleArgs: ExampleArgs }) {
  return (
    <FormField>
      <Label>Subscribe</Label>
      <Input defaultValue="hello@cocokits.com"/>
      <Styled.Trailing clickable>
        <SvgIcon icon={Icons.arrowRight}/>
      </Styled.Trailing>
    </FormField>
  );
}
