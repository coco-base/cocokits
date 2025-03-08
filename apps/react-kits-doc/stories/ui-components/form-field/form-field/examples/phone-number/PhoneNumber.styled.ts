import styled from 'styled-components';

import { Prefix as CckPrefix } from '@cocokits/react-components';

const Prefix = styled(CckPrefix)`
  color: var(--prefix-color);
  font: var(--prefix-font);
`;

const OptionWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const Styled = {
  Prefix,
  OptionWrapper,
};
