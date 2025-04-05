import { useState } from 'react';

import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/checkbox/checkbox-label-through.config';
import { Checkbox } from '@cocokits/react-checkbox';

import { Styled } from './CheckboxLabelThrough.styled';

export function CheckboxLabelThrough(props: { cckExampleArgs: ExampleArgs }) {
  const [checked, setChecked] = useState(false);

  return (
    <Checkbox size={props.cckExampleArgs.size} value={1} checked={checked} onChange={() => setChecked((prev) => !prev)}>
      <Styled.StrikedLabel style={{ textDecoration: checked ? 'line-through' : 'none' }}>
        Checkbox Label
      </Styled.StrikedLabel>
    </Checkbox>
  );
}
