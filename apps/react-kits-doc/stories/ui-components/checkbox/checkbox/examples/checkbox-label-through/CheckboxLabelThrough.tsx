import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/checkbox/checkbox-label-through.config';
import { Checkbox } from '@cocokits/react-checkbox';

import { Styled } from './CheckboxLabelThrough.styled';

export function CheckboxLabelThrough(props: { cckExampleArgs: ExampleArgs }) {
  return (
    <Checkbox size="md" value="YOUR_VALUE">
      <Styled.StrikedLabel>Checkbox Label</Styled.StrikedLabel>
    </Checkbox>
  );
}
