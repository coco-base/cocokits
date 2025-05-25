import styled from 'styled-components';

import { Trailing } from '@cocokits/react-components';

const _Trailing = styled(Trailing)`
  &.cck-trailing {
    background-color: var(--trailing-bg);

    &:hover:not(:active) {
      background-color: var(--trailing-bg-hover);
    }

    &:active {
      background-color: var(--trailing-bg-active);
    }

    .cck-svg-icon .cck-svg-icon__svg {
      fill: var(--trailing-color);
    }
  }
`;

export const Styled = {
  Trailing: _Trailing,
};
