import React from 'react';
import styled from "styled-components";

import { Icons } from '@cocokits/common-icons';
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/button/stack-vertical-button.config';
import { Button, SvgIcon } from '@cocokits/react-components';

export function StackVerticalButton(props: { cckExampleArgs: ExampleArgs }) {
  return (
    <HostStyles>
      <Button
        type={props.cckExampleArgs.firstButtonType}
        size={props.cckExampleArgs.firstButtonSize}
        color={props.cckExampleArgs.firstButtonColor}>
        Skip
      </Button>

      <Button
        type={props.cckExampleArgs.secondButtonType}
        size={props.cckExampleArgs.secondButtonSize}
        color={props.cckExampleArgs.secondButtonColor}>
        Confirm
        <SvgIcon icon={Icons.arrowRight} />
      </Button>
    </HostStyles>
  );
}

const HostStyles = styled.div`
  display: flex;
  flex-direction: column;
  width: 150px;
  gap: 12px;
`;
