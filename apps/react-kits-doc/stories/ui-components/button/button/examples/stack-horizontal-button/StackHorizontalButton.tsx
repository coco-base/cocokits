import styled from 'styled-components';

import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/button/stack-horizontal-button.config';
import { Button } from '@cocokits/react-components';

export function StackHorizontalButton(props: { cckExampleArgs: ExampleArgs }) {
  return (
    <HostStyles>
      <Button
        type={props.cckExampleArgs.firstButtonType}
        size={props.cckExampleArgs.firstButtonSize}
        color={props.cckExampleArgs.firstButtonColor}>
        Cancel
      </Button>

      <Button
        type={props.cckExampleArgs.secondButtonType}
        size={props.cckExampleArgs.secondButtonSize}
        color={props.cckExampleArgs.secondButtonColor}>
        Confirm
      </Button>
    </HostStyles>
  );
}

const HostStyles = styled.div`
  display: flex;
  gap: 12px;
`;
