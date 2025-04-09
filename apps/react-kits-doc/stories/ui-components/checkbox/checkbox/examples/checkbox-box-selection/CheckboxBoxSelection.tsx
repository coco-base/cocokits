import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/checkbox/checkbox-box-selection.config';
import { Checkbox } from '@cocokits/react-components';

import { Styled } from './CheckboxBoxSelection.styled';

export function CheckboxBoxSelection(props: { cckExampleArgs: ExampleArgs }) {
  return (
    <Styled.Container>
      <Styled.Box>
        <Checkbox value={1}>Vegetarian</Checkbox>
      </Styled.Box>
      <Styled.Box>
        <Checkbox value={2}>Gluten-Free</Checkbox>
      </Styled.Box>
    </Styled.Container>
  );
}
