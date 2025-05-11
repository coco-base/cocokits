import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/checkbox/checkbox-group-column.config';
import { Checkbox } from '@cocokits/react-components';

import { Styled } from './CheckboxGroupColumn.styled';

export function CheckboxGroupColumn(props: { cckExampleArgs: ExampleArgs }) {
  return (
    <Styled.CheckboxGroupColumn>
      <Styled.Label>My hobbies</Styled.Label>
      <Checkbox size={props.cckExampleArgs.size} value={1}>
        Comic books
      </Checkbox>
      <Checkbox size={props.cckExampleArgs.size} value={2}>
        Listen to music
      </Checkbox>
      <Checkbox size={props.cckExampleArgs.size} value={3}>
        Travel the world
      </Checkbox>
      <Checkbox size={props.cckExampleArgs.size} value={4}>
        Watch movies
      </Checkbox>
    </Styled.CheckboxGroupColumn>
  );
}
