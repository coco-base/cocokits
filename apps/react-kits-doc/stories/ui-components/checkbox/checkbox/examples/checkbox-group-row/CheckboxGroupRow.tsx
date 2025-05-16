import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/checkbox/checkbox-group-row.config';
import { Checkbox } from '@cocokits/react-components';

import { Styled } from './CheckboxGroupRow.styled';

export function CheckboxGroupRow(props: { cckExampleArgs: ExampleArgs }) {
  return (
    <div>
      <Styled.Label>Favorite food</Styled.Label>
      <Styled.CheckboxGroup>
        <Checkbox size={props.cckExampleArgs.size} value={1}>
          Pizza
        </Checkbox>
        <Checkbox size={props.cckExampleArgs.size} value={2}>
          Pasta
        </Checkbox>
        <Checkbox size={props.cckExampleArgs.size} value={3}>
          Fruits
        </Checkbox>
      </Styled.CheckboxGroup>
    </div>
  );
}
