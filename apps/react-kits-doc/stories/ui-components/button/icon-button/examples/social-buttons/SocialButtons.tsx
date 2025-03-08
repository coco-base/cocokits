import { styled } from 'styled-components';

import { Icons } from '@cocokits/common-icons';
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/icon-button/social-buttons.config';
import { IconButton, SvgIcon } from '@cocokits/react-components';

export function SocialButtons(props: { cckExampleArgs: ExampleArgs }) {
  return (
    <HostStyled>
      <IconButton
        color={props.cckExampleArgs.color}
        type={props.cckExampleArgs.type}
        size={props.cckExampleArgs.size}>
        <SvgIcon icon={Icons.x} size={props.cckExampleArgs.iconSize}/>
      </IconButton>

      <IconButton
        color={props.cckExampleArgs.color}
        type={props.cckExampleArgs.type}
        size={props.cckExampleArgs.size}>
        <SvgIcon icon={Icons.github} size={props.cckExampleArgs.iconSize}/>
      </IconButton>

      <IconButton
        color={props.cckExampleArgs.color}
        type={props.cckExampleArgs.type}
        size={props.cckExampleArgs.size}>
        <SvgIcon icon={Icons.instagram} size={props.cckExampleArgs.iconSize}/>
      </IconButton>
    </HostStyled>
  );
}

const HostStyled = styled.div`
  display: flex;
  gap: 8px;
`;
