import _Styled from 'styled-components';

import { Prefix as CckPrefix } from '@cocokits/react-components';

const Prefix = _Styled(CckPrefix)`
  color: var(--prefix-color);
  font: var(--prefix-font);
`;

const OptionWrapper = _Styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const Styled = {
  Prefix,
  OptionWrapper,
};
